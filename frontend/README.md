# DLMS Frontend

Live site: https://dlms-skjh.onrender.com
API base (production): https://dlms-driving-license-management-system-2.onrender.com/api

## 🚀 Recent Updates

### Codebase Optimization
- ✅ Unnecessary comments have been removed to improve code clarity
- ✅ Code structure maintained with important documentation preserved
- ✅ Performance improvements implemented

## Development

- npm install
- Create .env with:
  - VITE_API_URL=http://localhost:5004/api
  - VITE_API_DEBUG=true
- npm run dev (http://localhost:5173)

## Build

- npm run build (output in dist/)
- To point a production build at your API, set VITE_API_URL during build/deploy
  - VITE_API_URL=https://dlms-driving-license-management-system-v1.onrender.com/api
  - npm run dev (http://localhost:5173)

## Notes

- The app uses axios via src/config/api.js which reads VITE_API_URL and falls back to the production API base above if not set.
