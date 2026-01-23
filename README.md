# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Maintenance Mode

The application includes a built-in maintenance mode feature that can be enabled by setting the `VITE_MAINTENANCE_MODE` environment variable.

### How to Enable Maintenance Mode

1. Open the `.env` file in the project root
2. Set the maintenance mode variable:
   ```env
   VITE_MAINTENANCE_MODE=true
   ```
3. Restart the development server or rebuild the application

### Accepted Values

The following values will enable maintenance mode:
- `true`
- `1`
- `yes`

Any other value (or unset) will keep the application in normal mode.

### Features

When maintenance mode is enabled:
- All users see a professional maintenance page instead of the application
- The page includes a countdown timer that auto-refreshes every 5 minutes
- Users can manually check status with a refresh button
- Contact information is provided for urgent inquiries
- The page maintains the app's design theme and branding

### Disabling Maintenance Mode

To return to normal operation:
1. Set `VITE_MAINTENANCE_MODE=false` or remove/comment out the variable
2. Restart the development server or rebuild the application

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
