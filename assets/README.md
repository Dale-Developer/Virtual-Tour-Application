# Add your application logo here

1. Save your existing logo as `brand-logo.png` in this `assets` folder.
2. Open `src/components/Logo.js`.
3. Change `const BRAND_LOGO = null;` to `const BRAND_LOGO = require('../../assets/brand-logo.png');`.
4. Use a transparent PNG where possible. A square or horizontal logo works best; the component scales it with `resizeMode="contain"`.

The app intentionally uses a text/icon fallback until you add your own file. No replacement logo is included.

## Required files
- `assets/start-img.jpg`: the default welcome-screen photo. Use **1080 x 1920 px (9:16)**. Admins can replace it later in Admin > Settings > Welcome screen image.
- `assets/brand-logo.png` (optional): see `src/components/Logo.js`.
