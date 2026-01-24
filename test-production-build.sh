#!/bin/bash

echo "🧪 Testing Production Build Configuration..."
echo ""

# Check if .env.production exists
if [ -f ".env.production" ]; then
    echo "✅ .env.production exists"
    echo "   Content:"
    cat .env.production | sed 's/^/   /'
else
    echo "❌ .env.production NOT FOUND!"
    exit 1
fi

echo ""
echo "📦 Building for production..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📊 Build output:"
    ls -lh dist/
    echo ""
    echo "🔍 Checking index.html for API URL..."
    if grep -q "wizmedik.com/api" dist/assets/*.js 2>/dev/null; then
        echo "✅ Production API URL found in build"
    else
        echo "⚠️  Could not verify API URL in build (this is normal if using env variables)"
    fi
    echo ""
    echo "🚀 To test locally:"
    echo "   npx serve -s dist -l 3000"
    echo ""
    echo "📤 To deploy:"
    echo "   Upload dist/ folder to server"
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi
