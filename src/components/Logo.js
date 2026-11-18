import React, { useEffect, useState } from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSettings } from '../context/AppSettingsContext';

// Optional bundled logo. Add your file at assets/brand-logo.png, then set this to:
// const BRAND_LOGO = require('../../assets/brand-logo.png');
// Keeping it null lets the app run before a logo file is added.
const BRAND_LOGO = require('../../assets/brand-logo.png');

/** Which logo shows (first match wins):
 *  1. the logo an admin uploaded in Admin > Settings (stored in the database)
 *  2. BRAND_LOGO, the file bundled with the app
 *  3. a simple icon + wordmark fallback */
export default function Logo({ size = 22, color = '#fff', style, source = BRAND_LOGO, showWordmark = true }) {
  const { logoUri } = useAppSettings();
  const resolved = logoUri ? { uri: logoUri } : source;
  const [ratio, setRatio] = useState(2.3);

  useEffect(() => {
    if (!resolved) return;
    if (resolved.uri) {
      Image.getSize(resolved.uri, (w, h) => h && setRatio(clamp(w / h)), () => {});
    } else {
      const a = Image.resolveAssetSource(resolved);
      if (a?.width && a?.height) setRatio(clamp(a.width / a.height));
    }
  }, [logoUri, source]);

  if (resolved) {
    const height = size * 2.2;
    return (
      <Image
        source={resolved}
        accessibilityLabel="Application logo"
        resizeMode="contain"
        style={[{ height, width: height * ratio, maxWidth: '100%' }, style]}
      />
    );
  }

  return (
    <View style={[styles.row, style]}>
      <View style={styles.mark}>
        <Ionicons name="compass" size={size + 2} color={color} />
      </View>
      {showWordmark ? <Text style={[styles.text, { fontSize: size, color }]}>CALABARZON</Text> : null}
    </View>
  );
}

const clamp = (r) => Math.min(Math.max(r, 0.5), 4.5);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mark: { width: 34, height: 34, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '900', letterSpacing: 1.1 },
});
