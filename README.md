# CALABARZON Explore — React Native / Expo

A mobile cultural tourism app for discovering destinations across Cavite, Laguna, Batangas, Rizal and Quezon. Two roles share one design: **Tourist** and **Admin**.

## Run locally
```bash
npm install
npx expo install --fix      # aligns package versions with your Expo SDK (includes react-native-webview)
npx expo start -c           # scan the QR code with Expo Go
```
Admin demo login: `admin` / `admin123` (change it in Admin > Settings > Change password).

## Features
- **Tourist:** browse, search and filter destinations; interactive cultural map; virtual tour (panorama + history and culture); quizzes with automatic scoring and explanations; progress tracking; Settings (account details, change password, log out, delete account).
- **Admin:** dashboard; destination CRUD (images, panorama, coordinates); quiz question manager; tourist list and progress; Settings (app logo, account, password, reset sample data).

## Logo
Three levels, first match wins:
1. **Admin > Settings > App logo** (stored in the database, applies immediately across the app).
2. A bundled file: put your logo at `assets/brand-logo.png`, then in `src/components/Logo.js` set
   `const BRAND_LOGO = require('../../assets/brand-logo.png');`
3. The built-in icon + wordmark fallback.

## Database (SQLite, `expo-sqlite`)
| Table | Columns |
|---|---|
| `users` | user_id PK, first_name, last_name, username UNIQUE, password_hash, role (`Admin`/`Tourist`), created_at |
| `destinations` | destination_id PK, destination_name, description, destination_address, category (enum), image, latitude, longitude, panorama_asset, created_by FK, created_at, updated_at |
| `quiz_questions` | quiz_id PK, destination_id FK, question, options (JSON), correct_answer (index 0-3), explanation |
| `user_progress` | progress_id PK, user_id FK, destination_id FK, quiz_score, quiz_total, completed_at |

Helper tables (not in the design document): `session` (who is logged in) and `app_settings` (custom logo).
A destination is **completed** when the best quiz score is 60% or higher (`PASSING_PERCENT` in `src/db/database.js`).

## Map
The Places tab uses Leaflet with OpenStreetMap data inside a WebView. It needs no API key but **needs an internet connection** to load map tiles. The panorama viewer is a draggable wide image, not a true 360-degree viewer.

## Data and security status
This version stores everything locally on the device. It does not sync between devices. Passwords are SHA-256 hashed on the device, which is fine for a class project but not for production. A production release needs a hosted backend, server-side authentication and grading, licensed photography, and a privacy policy.

## Structure
- `src/screens/auth/` welcome, register, login
- `src/screens/tourist/` home, places, destination details, virtual tour, quizzes, progress, settings
- `src/screens/admin/` dashboard, destinations, quiz manager, users, settings
- `src/components/` shared UI (used by both roles)
- `src/db/` schema, queries, sample data
- `src/theme.js` design tokens shared by tourist and admin

## MapTiler key (optional)
1. Create a free account at cloud.maptiler.com and copy your API key (Account > API keys).
2. Copy `.env.example` to `.env` and paste the key: `EXPO_PUBLIC_MAPTILER_KEY=...`
3. Restart with `npx expo start -c`.

Without a key the map uses free CARTO tiles. `.env` is listed in `.gitignore`, so the key is not committed. If you restrict the key to allowed origins in the MapTiler dashboard, add `https://localhost` because the map runs inside a WebView.
