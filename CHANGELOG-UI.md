# UI and project update log

## Updated files

| File | Changes |
|---|---|
| `src/theme.js` | Replaced the old bright-blue/pink palette with a consistent coastal teal, sea-glass accent, neutral background, and separate admin palette. Standardized spacing, radius, and shadows. |
| `src/components/Logo.js` | Added an optional local image logo hook. The app keeps a fallback mark until the owner adds `assets/brand-logo.png`; no new brand logo is imposed. |
| `src/components/Button.js` | Standardized button height, shape, variants, loading/disabled behavior, and accessibility semantics. |
| `src/components/Input.js` | Improved form spacing, validation state, helper text, and focus color. |
| `src/components/SearchBar.js` | Updated search styling, accessibility labels, and clear action. |
| `src/components/DestinationCard.js` | Improved image-card proportions, typography, location row, category tag, and completion badge. |
| `src/components/AdminHeader.js` | Updated admin header hierarchy, back control, and admin identity label. |
| `src/navigation/RootNavigator.js` | Reworked bottom tabs to show readable labels, improved selected/inactive states, loading screen, and database error state. Existing role-based routes remain. |
| `src/screens/auth/StartScreen.js` | Rebuilt the welcome screen hierarchy and calls to action while preserving registration/login routes. |
| `src/screens/auth/AuthScreen.js` | Improved registration/login layout, added password visibility toggle, stronger inline validation presentation, and clearer privacy helper. Existing auth context calls remain. |
| `src/screens/tourist/HomeScreen.js` | Rebuilt the home header, welcome message, map shortcut, search, category browsing, destination count, refresh handling, and load-error feedback. Existing SQLite queries and destination navigation remain. |
| `src/screens/tourist/PlacesScreen.js` | Improved cultural map page, province filters, selected destination preview, destination list, and loading error feedback. Uses the existing coordinate-based `CultureMap` component. |
| `README.md` | Replaced outdated project notes with setup, logo integration, current backend limitations, and production-readiness checklist. |
| `assets/README.md` | Added instructions for adding the user's own logo. |

## Preserved files and behavior

- Existing SQLite schema, seed data, and database query functions.
- Existing tourist and admin screens not listed above.
- Existing destination CRUD, quiz flows, quiz history, and progress functions.
- Existing React Native + Expo stack and navigation route names.

## Not represented as completed

- Hosted/cloud backend and cross-device synchronization.
- Production authentication and server-side quiz answer protection.
- Full interactive map SDK and live map tiles.
- Fully functional 360-degree panorama renderer.
- Real destination image licensing/verification.

These are identified as follow-up production work in the README rather than being represented as implemented when they are not present in the supplied project.
## Latest update (merged on top of the changes above)

| Area | Change |
|---|---|
| Filter chips (`Chips.js`) | Fixed the stretched / uneven chips (All, Heritage, Churches, Falls, ...). The row no longer grows vertically, chips have a fixed height with centered text, and the labels never wrap. Used by Home, Places and Admin > Destinations. |
| Admin UI | Admin now uses the tourist palette (`adminColors` is an alias of `colors`), the same hero header (`AdminHeader`), buttons, inputs, search bar, chips, rows and tab bar. |
| Tourist Settings tab | Account settings (name, username), change password, log out, delete account. |
| Places map | Replaced the drawn preview with a real, interactive map (Leaflet + OpenStreetMap data in a WebView, no API key). The page does not scroll while you drag the map. |
| App logo | Admin > Settings can upload or reset the logo. `Logo.js` shows the uploaded logo first, then `BRAND_LOGO` from `assets/`, then the fallback mark. |
| Spacing | Lists no longer reserve space for the old floating tab bar. |
