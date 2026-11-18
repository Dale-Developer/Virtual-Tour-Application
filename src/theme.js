// Shared design tokens. The tourist and admin sides use the SAME palette and components.
export const colors = {
  primary: '#123B4A',
  primaryDark: '#0B2935',
  accent: '#16A6A1',
  accentSoft: '#DDF5F1',
  bg: '#F4F7F8',
  card: '#FFFFFF',
  text: '#172B36',
  muted: '#71818A',
  border: '#E1E9EC',
  success: '#16845B',
  danger: '#C84C4C',
  warning: '#D18A20',
  overlay: 'rgba(8, 29, 39, 0.52)',
};

// Admin intentionally reuses the tourist palette so both sides look like one app.
export const adminColors = colors;

export const radius = { xs: 8, sm: 12, md: 16, lg: 22, xl: 28, pill: 999 };

export const shadow = {
  shadowColor: '#17313A',
  shadowOpacity: 0.07,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

export const CATEGORIES = ['Heritage', 'Churches', 'Falls', 'Nature', 'Beaches', 'Museums'];
export const PROVINCES = ['Cavite', 'Laguna', 'Batangas', 'Rizal', 'Quezon'];
