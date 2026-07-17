import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { fetchStoreSettings, saveStoreSettings, StoreSettings } from '@/lib/settingsApi';

interface StoreSettingContextType {
  settings: StoreSettings;
  isLoading: boolean;
  updateSettings: (data: StoreSettings) => Promise<void>;
}

const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'J Atelier',
  store_url: 'jatelier.com',
  support_email: 'hello@jatelier.com',
  currency: 'USD',
};

const StoreSettingContext = createContext<StoreSettingContextType | undefined>(undefined);

export function StoreSettingProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted settings on app start
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchStoreSettings();
        // Merge with defaults so no field is ever undefined
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      } catch {
        // Keep defaults if the backend is unreachable
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Save and immediately reflect changes everywhere
  const updateSettings = useCallback(async (data: StoreSettings) => {
    const saved = await saveStoreSettings(data);
    // The POST response also contains a 'message' field — pick only known keys
    setSettings({
      store_name:    saved.store_name    ?? DEFAULT_SETTINGS.store_name,
      store_url:     saved.store_url     ?? DEFAULT_SETTINGS.store_url,
      support_email: saved.support_email ?? DEFAULT_SETTINGS.support_email,
      currency:      saved.currency      ?? DEFAULT_SETTINGS.currency,
    });
  }, []);

  return (
    <StoreSettingContext.Provider value={{ settings, isLoading, updateSettings }}>
      {children}
    </StoreSettingContext.Provider>
  );
}

export function useStoreSetting() {
  const ctx = useContext(StoreSettingContext);
  if (!ctx) throw new Error('useStoreSetting must be used within a StoreSettingProvider');
  return ctx;
}
