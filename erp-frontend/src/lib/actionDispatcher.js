import { useState } from 'react';
import toast from 'react-hot-toast';
import { getApiAction } from './apiRegistry';

export const useActionDispatcher = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const dispatchAction = async (actionKey, payload = {}, options = {}) => {
    const { 
      showToast = true, 
      successMessage = 'Action completed successfully',
      errorMessage = 'An error occurred'
    } = options;

    const actionFn = getApiAction(actionKey);
    
    if (!actionFn) {
      const err = new Error(`Action ${actionKey} is not registered.`);
      setError(err);
      if (showToast) toast.error(err.message);
      return { success: 0, message: err.message };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await actionFn(payload);
      
      // Standardize response checking assuming your APIs return { success: 1|0, message, data }
      if (response && response.success === 1) {
        if (showToast) toast.success(response.message || successMessage);
        return response;
      } else {
        const errorMsg = response?.message || errorMessage;
        if (showToast) toast.error(errorMsg);
        return response || { success: 0, message: errorMsg };
      }
    } catch (err) {
      console.error(`Error dispatching action ${actionKey}:`, err);
      setError(err);
      if (showToast) {
        toast.error(err.response?.data?.message || err.message || errorMessage);
      }
      return { success: 0, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  return { dispatchAction, isLoading, error };
};
