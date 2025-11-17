// src/hooks/useApp.ts
import { useContext } from 'react';
import { AppContext, AppContextType } from '../context/AppContext';

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
