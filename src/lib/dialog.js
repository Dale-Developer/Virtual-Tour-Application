import { Alert, Platform } from 'react-native';

/**
 * Drop-in replacement for Alert.alert(title, message, buttons).
 *
 * React Native's Alert.alert does NOTHING on the web, so on the website the "Log out?" prompt never
 * appeared (and logout never ran), and form errors were invisible. On phones this still uses the
 * normal native alert; in the browser it uses window.alert / window.confirm.
 *
 * `buttons` has the same shape as Alert.alert: [{ text, style: 'cancel' | 'destructive', onPress }].
 */
export function showAlert(title, message, buttons) {
  if (Platform.OS !== 'web') {
    return Alert.alert(title, message, buttons);
  }
  const text = [title, message].filter(Boolean).join('\n\n');
  const list = Array.isArray(buttons) ? buttons : [];

  // Two or more buttons = a question. OK runs the action, Cancel runs the cancel handler.
  if (list.length > 1) {
    const cancel = list.find((b) => b.style === 'cancel');
    const action = list.find((b) => b !== cancel);
    if (window.confirm(text)) action?.onPress?.();
    else cancel?.onPress?.();
    return;
  }

  // Zero or one button = just a message.
  window.alert(text);
  list[0]?.onPress?.();
}
