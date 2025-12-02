import { useState, useCallback, useEffect } from 'react';
import { checkSpinHistoryAPI, recordSpinViaAPI } from '../lib/api';

export interface SpinLogicState {
  hasSpun: boolean;
  lastPrize: string | null;
  isLoading: boolean;
  error: string | null;
}

interface APIResponse {
  statusCode: number;
  error?: string;
  existingPrize?: string;
  prize?: string;
}

export function useSpinLogic(phoneNumber: string | null) {
  const [state, setState] = useState<SpinLogicState>({
    hasSpun: false,
    lastPrize: null,
    isLoading: false,
    error: null,
  });

  const checkSpinHistory = useCallback(async () => {
    if (!phoneNumber) {
      setState((prev) => ({ ...prev, error: 'Phone number is required' }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const spinStatus = await checkSpinHistoryAPI(phoneNumber);
      setState({
        hasSpun: spinStatus.hasSpun,
        lastPrize: spinStatus.prize || null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to check spin history',
      }));
    }
  }, [phoneNumber]);

  useEffect(() => {
    if (phoneNumber) {
      checkSpinHistory();
    }
  }, [phoneNumber, checkSpinHistory]);

  const recordNewSpin = useCallback(
    async (name: string, prize: string) => {
      if (!phoneNumber) {
        setState((prev) => ({ ...prev, error: 'Phone number is required' }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response: APIResponse = await recordSpinViaAPI({
          phoneNumber,
          name,
          prize,
        });

        if (response.statusCode === 409 && response.existingPrize) {
          setState({
            hasSpun: true,
            lastPrize: response.existingPrize,
            isLoading: false,
            error: null,
          });
          return;
        }

        if (response.statusCode !== 201) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: response.error || 'Failed to record spin',
          }));
          return;
        }

        setState({
          hasSpun: true,
          lastPrize: prize,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to record spin',
        }));
      }
    },
    [phoneNumber]
  );

  const reset = useCallback(() => {
    setState({
      hasSpun: false,
      lastPrize: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    checkSpinHistory,
    recordNewSpin,
    reset,
  };
}
