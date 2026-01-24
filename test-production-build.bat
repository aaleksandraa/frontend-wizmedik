@echo off
echo 🧪 Testing Production Build Configuration...
echo.

REM Check if .env.production exists
if exist ".env.production" (
    echo ✅ .env.production exists
    echo    Content:
    type .env.production
) else (
    echo ❌ .env.production NOT FOUND!
    exit /b 1
)

echo.
echo 📦 Building for production...
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo ✅ Build successful!
    echo.
    echo 📊 Build output:
    dir dist /s
    echo.
    echo 🚀 To test locally:
    echo    npx serve -s dist -l 3000
    echo.
    echo 📤 To deploy:
    echo    Upload dist/ folder to server
) else (
    echo.
    echo ❌ Build failed!
    exit /b 1
)
