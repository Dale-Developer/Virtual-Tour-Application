import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform, TouchableOpacity } from 'react-native';

// react-native-webview does not work on the web, so it is only loaded on phones.
// On the website the same map page runs inside an <iframe>.
const WebView = Platform.OS === 'web' ? null : require('react-native-webview').WebView;
import { colors, radius } from '../theme';

/*
 * A real, pannable and zoomable map (Leaflet) shown in a WebView. It needs an internet connection.
 *
 * Map tiles:
 *  - PRIMARY: MapTiler "streets-v4" when EXPO_PUBLIC_MAPTILER_KEY is set in the .env file.
 *  - FALLBACK: free CARTO tiles (no key). Used when there is no valid key, or when MapTiler
 *    rejects the key ("API key required" / "Invalid key"), so the map never ends up blank.
 */
// Tolerate a quoted value or stray spaces in .env, and ignore the placeholder from .env.example.
const RAW_KEY = String(process.env.EXPO_PUBLIC_MAPTILER_KEY || '').trim().replace(/^['"]|['"]$/g, '').trim();
const MAPTILER_KEY = RAW_KEY && !/PASTE|YOUR|INSERT/i.test(RAW_KEY) ? RAW_KEY : '';

const PRIMARY = MAPTILER_KEY
  ? {
      name: 'MapTiler',
      url: `https://api.maptiler.com/maps/streets-v4/256/{z}/{x}/{y}.png?key=${encodeURIComponent(MAPTILER_KEY)}`,
      attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 20,
    }
  : null;

const FALLBACK = {
  name: 'CARTO',
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  maxZoom: 19,
};

function buildHtml(markers) {
  const data = JSON.stringify(markers).replace(/</g, '\\u003c');
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css"/>
<style>
  html, body, #map { height: 100%; margin: 0; background: #BFD7F5; font-family: -apple-system, Roboto, sans-serif; }
  .pin { width: 20px; height: 20px; border-radius: 50%; background: #E45A5A; border: 3px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,.4); box-sizing: content-box; }
  .pin.active { width: 26px; height: 26px; background: #D6218C; }
  .msg { padding: 24px; text-align: center; color: #17313A; }
</style></head><body>
<div id="map"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
<script>
  if (!window.ReactNativeWebView) {
    window.ReactNativeWebView = { postMessage: function (m) { window.parent.postMessage(m, '*'); } };
  }
  function post(o) { window.ReactNativeWebView.postMessage(JSON.stringify(o)); }
  if (typeof L === 'undefined') {
    document.body.innerHTML = '<div class="msg"><b>The map could not load.</b><br>Check your internet connection and reopen this tab.</div>';
    post({ type: 'error' });
  } else {
    var DATA = ${data};
    var map = L.map('map', { zoomControl: true }).setView([14.1, 121.1], 8);
    var PRIMARY = ${JSON.stringify(PRIMARY).replace(/</g, '\\u003c')};
    var FALLBACK = ${JSON.stringify(FALLBACK).replace(/</g, '\\u003c')};
    var layer = null;
    function addLayer(t) {
      layer = L.tileLayer(t.url, { maxZoom: t.maxZoom, subdomains: 'abcd', attribution: t.attribution }).addTo(map);
    }
    function useFallback(reason) {
      if (layer) map.removeLayer(layer);
      addLayer(FALLBACK);
      post({ type: 'tiles', provider: FALLBACK.name, reason: reason });
    }
    if (!PRIMARY) {
      useFallback('no key in .env');
    } else {
      // Load one real tile first. If MapTiler refuses the key, the image fails and we switch.
      var settled = false;
      var probe = new Image();
      var timer = setTimeout(function () { if (!settled) { settled = true; useFallback('MapTiler did not answer'); } }, 7000);
      probe.onload = function () {
        if (settled) return; settled = true; clearTimeout(timer);
        addLayer(PRIMARY);
        post({ type: 'tiles', provider: PRIMARY.name });
      };
      probe.onerror = function () {
        if (settled) return; settled = true; clearTimeout(timer);
        useFallback('MapTiler rejected the key');
      };
      probe.src = PRIMARY.url.replace('{z}', '6').replace('{x}', '52').replace('{y}', '28');
    }

    var markers = {};
    function pinIcon(active) {
      var s = active ? 32 : 26;
      return L.divIcon({ className: '', html: '<div class="pin' + (active ? ' active' : '') + '"></div>', iconSize: [s, s], iconAnchor: [s / 2, s / 2] });
    }
    DATA.forEach(function (d) {
      var m = L.marker([d.lat, d.lng], { icon: pinIcon(false) }).addTo(map);
      m.bindTooltip(d.name, { direction: 'top', offset: [0, -14] });
      m.on('click', function () { post({ type: 'select', id: d.id }); });
      markers[d.id] = m;
    });

    if (DATA.length > 1) {
      map.fitBounds(L.latLngBounds(DATA.map(function (d) { return [d.lat, d.lng]; })), { padding: [36, 36], maxZoom: 12 });
    } else if (DATA.length === 1) {
      map.setView([DATA[0].lat, DATA[0].lng], 13);
    }

    window.selectMarker = function (id) {
      Object.keys(markers).forEach(function (k) {
        var on = id !== null && String(k) === String(id);
        markers[k].setIcon(pinIcon(on));
        markers[k].setZIndexOffset(on ? 1000 : 0);
      });
      if (id !== null && markers[id]) map.panTo(markers[id].getLatLng());
    };
    post({ type: 'ready' });
  }
</script></body></html>`;
}

export default function CultureMap({ items, selectedId, onSelect, height = 250 }) {
  const ref = useRef(null); // the WebView (phones) or the iframe (web)
  const [loading, setLoading] = useState(true);
  const [failedMsg, setFailedMsg] = useState('');
  const [provider, setProvider] = useState('');
  const [attempt, setAttempt] = useState(0);
  const isWeb = Platform.OS === 'web';

  const markers = useMemo(
    () =>
      items
        .filter((d) => d.latitude != null && d.longitude != null)
        .map((d) => ({ id: d.id, name: d.name, lat: d.latitude, lng: d.longitude })),
    [items]
  );
  // Only rebuild the page when the set of markers really changes.
  const key = JSON.stringify(markers);
  const html = useMemo(() => buildHtml(markers), [key]);

  const highlight = () => {
    const id = selectedId == null ? null : Number(selectedId);
    if (isWeb) {
      try { ref.current?.contentWindow?.selectMarker?.(id); } catch {}
    } else {
      ref.current?.injectJavaScript(`window.selectMarker && window.selectMarker(${id}); true;`);
    }
  };

  useEffect(() => { highlight(); }, [selectedId]);
  useEffect(() => { setLoading(true); setFailedMsg(''); }, [key, attempt]);

  // Never spin forever: after 12 seconds show a message and a Try again button.
  useEffect(() => {
    if (!loading) return undefined;
    const t = setTimeout(() => {
      setLoading(false);
      setFailedMsg('The map is taking too long to load. Check your internet connection.');
    }, 12000);
    return () => clearTimeout(t);
  }, [loading, key, attempt]);

  const handleMessage = (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.type === 'select') {
        const d = items.find((x) => x.id === msg.id);
        if (d) onSelect?.(d);
      } else if (msg.type === 'tiles') {
        setProvider(msg.reason ? `${msg.provider} (fallback: ${msg.reason})` : msg.provider);
        if (msg.reason) console.warn('[map] using fallback tiles:', msg.reason);
      } else if (msg.type === 'ready') {
        setLoading(false);
        setFailedMsg('');
        highlight();
      } else if (msg.type === 'error') {
        setLoading(false);
        setFailedMsg('The map needs an internet connection.');
      }
    } catch {}
  };

  // Website only: messages from the iframe arrive as window messages.
  useEffect(() => {
    if (!isWeb) return undefined;
    const onWindowMessage = (e) => {
      if (e.source === ref.current?.contentWindow && typeof e.data === 'string') handleMessage(e.data);
    };
    window.addEventListener('message', onWindowMessage);
    return () => window.removeEventListener('message', onWindowMessage);
  });

  return (
    <View style={[styles.wrap, { height }]}>
      {isWeb ? (
        React.createElement('iframe', {
          key: `web-${attempt}`,
          ref,
          srcDoc: html,
          title: 'Destination map',
          style: { border: 0, width: '100%', height: '100%', display: 'block', background: '#BFD7F5' },
        })
      ) : (
        <WebView
          key={`native-${attempt}`}
          ref={ref}
          originWhitelist={['*']}
          source={{ html, baseUrl: 'https://localhost/' }}
          onMessage={(e) => handleMessage(e.nativeEvent.data)}
          onError={() => { setLoading(false); setFailedMsg('The map needs an internet connection.'); }}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          nestedScrollEnabled
          setSupportMultipleWindows={false}
          style={{ backgroundColor: '#BFD7F5' }}
        />
      )}
      {__DEV__ && provider ? (
        <View style={styles.badge} pointerEvents="none"><Text style={styles.badgeText}>Tiles: {provider}</Text></View>
      ) : null}
      {loading && (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.overlayText}>Loading map…</Text>
        </View>
      )}
      {!!failedMsg && (
        <View style={styles.overlay}>
          <Text style={[styles.overlayText, { textAlign: 'center', paddingHorizontal: 24 }]}>{failedMsg}</Text>
          <TouchableOpacity style={styles.retry} onPress={() => setAttempt((a) => a + 1)} accessibilityRole="button">
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  wrap: {
    marginHorizontal: 16, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#BFD7F5',
    borderWidth: 1.5, borderColor: '#D7E6E7',
  },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF3F4', gap: 8 },
  retry: { marginTop: 4, backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 9 },
  retryText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  overlayText: { color: colors.muted, fontWeight: '600', fontSize: 13 },
});
