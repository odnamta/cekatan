'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export default function TestConnection() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    async function checkConnection() {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus('error');
          setErrorMessage(error.message);
        } else {
          setStatus('success');
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    }

    checkConnection();
  }, []);

  if (status === 'loading') {
    return (
      <div className="p-4 bg-yellow-900/50 text-yellow-300 rounded-lg mb-4">
        Checking Supabase connection...
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 bg-red-900/50 text-red-300 rounded-lg mb-4">
        ERROR: {errorMessage}
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-900/50 text-green-300 rounded-lg mb-4">
      SUCCESS: Supabase is connected!
    </div>
  );
}
