# wizMedik Frontend

React + TypeScript + Vite frontend aplikacija za wizMedik platformu.

## 🚀 Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Maps**: Leaflet
- **Icons**: Lucide React

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page components
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and helpers
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── dist/                # Build output (generated)
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies
```

## 🛠️ Development

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun

### Install Dependencies
```bash
npm install
# or
bun install
```

### Start Development Server
```bash
npm run dev
# or
bun run dev
```

Server će biti pokrenut na `http://localhost:8081`

### Build for Production
```bash
npm run build
# or
bun run build
```

`npm run build` sada radi production build plus SEO prerender, tako da `dist/` sadrži i statičke SEO rute kao `blog/{slug}/index.html`.

Ako želiš samo obični SPA build bez prerenderovanih ruta:

```bash
npm run build:spa
```

### Preview Production Build
```bash
npm run preview
# or
bun run preview
```

## 🔧 Configuration

### Environment Variables
Kreirajte `.env` fajl u `frontend/` folderu:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=wizMedik
```

### Vite Configuration
Vite je konfigurisan u `vite.config.ts`:
- Port: 8081
- Proxy: API requests se prosljeđuju na backend (port 8000)
- Code splitting: Optimizovano za production
- React dedupe: Sprečava multiple React instances

## 📦 Key Dependencies

### Core
- `react` - UI library
- `react-dom` - React DOM renderer
- `react-router-dom` - Routing
- `typescript` - Type safety

### UI & Styling
- `tailwindcss` - Utility-first CSS
- `@radix-ui/*` - Accessible UI primitives
- `lucide-react` - Icons
- `class-variance-authority` - Component variants
- `clsx` / `tailwind-merge` - Class name utilities

### Data Fetching & State
- `@tanstack/react-query` - Server state management
- `axios` - HTTP client

### Forms & Validation
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `@hookform/resolvers` - Form validation integration

### Maps
- `leaflet` - Interactive maps
- `react-leaflet` - React wrapper for Leaflet

## 🎨 UI Components

Projekat koristi shadcn/ui komponente koje su lokalno instalirane u `src/components/ui/`:
- Button, Input, Select, Dialog, Dropdown, Tabs
- Card, Badge, Avatar, Skeleton
- Toast notifications
- Form components
- i mnogo više...

## 🔐 Authentication

Authentication je implementiran kroz:
- `AuthContext` - React context za auth state
- `useAuth` hook - Pristup auth funkcijama
- Laravel Sanctum - Backend authentication
- Protected routes - Route guards

## 📱 Responsive Design

Aplikacija je potpuno responsive sa breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🚀 Deployment

### Build
```bash
npm run build
```

`npm run build` now automatically syncs `frontend/.htaccess` into `dist/.htaccess`.
This keeps Apache rules consistent and prevents old sitemap redirect rules from reappearing in `dist`.
It also runs SEO prerender and verifies that every manifest route file was actually generated before deploy.

### Deploy
Build output (`dist/` folder) može biti deploy-ovan na:
- Nginx
- Apache
- Vercel
- Netlify
- AWS S3 + CloudFront

For Apache deployments, always deploy the generated `dist/.htaccess` together with other `dist/*` files.
For static Apache deploys, also replace `dist/sw.js` on the server and remove stale files from `assets/` plus old prerendered route folders before copying the new `dist/`. Otherwise browsers can keep using an old service worker or dead hashed assets on direct URL opens.

If you want newly published blog posts to become indexable immediately without a full frontend redeploy, configure backend mirroring in production:

```env
SITEMAP_OUTPUT_PATH=/path/to/project/frontend/dist
SITEMAP_OUTPUT_MIRROR_PATHS=/var/www/vhosts/your-domain/httpdocs
```

Blog create/update already triggers backend prerender for `blog` and `blog/{slug}`, so with a live webroot mirror configured those static files stay fresh automatically.

### One-command static deploy
Ako frontend build i deploy radiš na istoj mašini koja ima pristup web root folderu, možeš koristiti:

```bash
FRONTEND_DEPLOY_TARGET=/var/www/vhosts/wizmedik.ba/httpdocs npm run deploy:static:seo
```

Ova komanda:
- napravi fresh production build
- odradi SEO prerender
- sigurno zamijeni kompletan sadržaj target web root foldera sadržajem iz `dist/`
- uključi `assets/`, `index.html`, `.htaccess`, `sw.js` i prerendered route foldere

Kad je `../backend/artisan` dostupan, SEO prerender sada automatski koristi lokalni Laravel command `seo:prerender-pages` umjesto remote sitemap fetch-a. To je preporučeni production put jer koristi isti backend/database kontekst kao live sajt. Ako želiš prisilno koristiti stari remote način, postavi `SEO_PRERENDER_MODE=remote`.

Nakon deploya možeš provjeriti live stanje sa:

```bash
npm run provjeri:deploy
```

Po defaultu provjerava `https://wizmedik.com`, `sw.js`, `/`, `/pitanja` i `/domovi-njega`, te potvrđuje da route HTML koristi iste trenutne asset hashove kao homepage.

Na Windows PowerShell:

```powershell
$env:FRONTEND_DEPLOY_TARGET='C:\path\to\httpdocs'
npm run deploy:static:seo
```

Za drugi domen:

```powershell
$env:FRONTEND_VERIFY_ORIGIN='https://staging.wizmedik.com'
npm run provjeri:deploy
```

Skripta odbija deploy u project folder ili filesystem root. Za nestandardne target putanje možeš eksplicitno dozvoliti:

```bash
ALLOW_ANY_DEPLOY_TARGET=1 FRONTEND_DEPLOY_TARGET=/custom/webroot npm run deploy:static:seo
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name wizmedik.com;
    root /var/www/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
    }
}
```

## 🧪 Testing

```bash
# Run tests (kada budu dodani)
npm run test
```

## 📝 Code Style

- ESLint za linting
- Prettier za formatting (opciono)
- TypeScript strict mode

## 🔗 Related

- Backend: `../backend/`
- Documentation: `../docs/`

## 📄 License

Proprietary - wizMedik
