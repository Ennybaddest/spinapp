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
  
  useEffect(() => {
    if (phoneNumber) {
      checkSpinHistory();
    }
  }, [phoneNumber]);

  const checkSpinHistory = useCallback(async () => {
    if (!phoneNumber) {
      setState((prev) => ({ ...prev, error: 'Phone number is required' }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // ⚠️ ASSUMPTION: This now calls a secure GET endpoint, not direct Supabase
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

        // 🔑 FIX 1: Handle the 409 Conflict Response (User already spun)
        if (response.statusCode === 409 && response.existingPrize) {
          setState({
            hasSpun: true,
            lastPrize: response.existingPrize,
            isLoading: false,
            error: null,
          });
          return;
        }

        // Handle other non-successful status codes (400, 500)
        if (response.statusCode !== 201) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: response.error || 'Failed to record spin',
          }));
          return;
        }

        // Success (201 Created)
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