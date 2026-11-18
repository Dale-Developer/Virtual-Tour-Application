import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

/** Image that falls back to a neutral placeholder if the URL is missing or fails to load.
 *  Children render on top of the image. (A View + absolute Image replaces the deprecated ImageBackground.) */
export default function SafeImage({ uri, source, style, children, resizeMode = 'cover' }) {
  const [failed, setFailed] = useState(false);
  // `source` is for bundled files (require('...')); `uri` is for web addresses and data URIs.
  const imageSource = source || (uri ? { uri } : null);
  useEffect(() => setFailed(false), [uri, source]);

  const showPlaceholder = !imageSource || failed;

  return (
    <View style={[style, { overflow: 'hidden', backgroundColor: '#D7E6E7' }]}>
      {showPlaceholder ? (
        <View style={styles.placeholder}>
          <Ionicons name="image-outline" size={34} color={colors.muted} />
        </View>
      ) : (
        <Image
          source={imageSource}
          style={StyleSheet.absoluteFill}
          resizeMode={resizeMode}
          onError={() => setFailed(true)}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
