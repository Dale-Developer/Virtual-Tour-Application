import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getSetting, setSetting, deleteSetting } from '../db/database';

const LOGO_KEY = 'app_logo';
const START_IMAGE_KEY = 'start_image';

/** Shown on the welcome screen until an admin uploads their own picture.
 *  Put your file at <project root>/assets/start-img.jpg (this path is relative to this file). */
export const DEFAULT_START_IMAGE = require('../../assets/start-img.jpg');

const noop = async () => {};
const AppSettingsContext = createContext({
  loaded: false, logoUri: null, setLogo: noop, resetLogo: noop,
  startImageUri: null, setStartImage: noop, resetStartImage: noop,
});

/** App-wide settings an admin can change (logo, welcome screen image). Must sit inside AuthProvider. */
export function AppSettingsProvider({ children }) {
  const { ready } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const [logoUri, setLogoUri] = useState(null);
  const [startImageUri, setStartImageUri] = useState(null);

  useEffect(() => {
    if (!ready) return;
    Promise.all([getSetting(LOGO_KEY), getSetting(START_IMAGE_KEY)])
      .then(([logo, start]) => { setLogoUri(logo || null); setStartImageUri(start || null); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [ready]);

  const value = {
    loaded,
    logoUri,
    setLogo: async (uri) => { await setSetting(LOGO_KEY, uri); setLogoUri(uri); },
    resetLogo: async () => { await deleteSetting(LOGO_KEY); setLogoUri(null); },
    startImageUri,
    setStartImage: async (uri) => { await setSetting(START_IMAGE_KEY, uri); setStartImageUri(uri); },
    resetStartImage: async () => { await deleteSetting(START_IMAGE_KEY); setStartImageUri(null); },
  };

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export const useAppSettings = () => useContext(AppSettingsContext);
