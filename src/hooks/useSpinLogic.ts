import { useState, useCallback } from 'react';
import { getUserSpinStatus, recordSpin } from '../lib/supabase';

export interface SpinLogicState {
  hasSpun: boolean;
  lastPrize: string | null;
  isLoading: boolean;
  error: string | null;
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
      const spinStatus = await getUserSpinStatus(phoneNumber);
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
        await recordSpin({ name, phone: phoneNumber, prize });
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
