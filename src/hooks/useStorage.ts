// hooks/useStorage.ts
import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';

/**
 * Hook personalizado para manejar storage con Capacitor Preferences
 * Similar a localStorage pero para apps nativas
 */
export function useStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Cargar valor inicial
  useEffect(() => {
    loadValue();
  }, [key]);

  const loadValue = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { value } = await Preferences.get({ key });
      
      if (value !== null) {
        const parsed = JSON.parse(value);
        setStoredValue(parsed);
      } else {
        setStoredValue(initialValue);
      }
    } catch (err) {
      console.error(`Error loading value for key "${key}":`, err);
      setError(err as Error);
      setStoredValue(initialValue);
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar valor
  const setValue = async (value: T | ((prev: T) => T)) => {
    try {
      setError(null);
      
      // Si es función, calcular nuevo valor
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Guardar en storage
      await Preferences.set({
        key,
        value: JSON.stringify(valueToStore),
      });
      
      // Actualizar estado local
      setStoredValue(valueToStore);
    } catch (err) {
      console.error(`Error saving value for key "${key}":`, err);
      setError(err as Error);
      throw err;
    }
  };

  // Eliminar valor
  const removeValue = async () => {
    try {
      setError(null);
      await Preferences.remove({ key });
      setStoredValue(initialValue);
    } catch (err) {
      console.error(`Error removing value for key "${key}":`, err);
      setError(err as Error);
      throw err;
    }
  };

  // Recargar valor
  const refresh = async () => {
    await loadValue();
  };

  return {
    value: storedValue,
    setValue,
    removeValue,
    refresh,
    isLoading,
    error,
  };
}

/**
 * Hook simplificado para valores simples (strings, numbers, booleans)
 */
export function useSimpleStorage(key: string, initialValue: string = '') {
  const [value, setValue] = useState<string>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadValue();
  }, [key]);

  const loadValue = async () => {
    try {
      setIsLoading(true);
      const { value: stored } = await Preferences.get({ key });
      setValue(stored || initialValue);
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      setValue(initialValue);
    } finally {
      setIsLoading(false);
    }
  };

  const saveValue = async (newValue: string) => {
    try {
      await Preferences.set({ key, value: newValue });
      setValue(newValue);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  };

  return { value, setValue: saveValue, isLoading };
}