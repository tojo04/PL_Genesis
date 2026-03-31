#!/bin/bash

set -e

echo "🚀 Starting Cerebrum frontend-only deployment..."

dfx stop
rm -rf .dfx

echo "📦 Starting Internet Computer replica..."
dfx start --clean --background

sleep 5

echo "🔨 Building frontend..."
cd src/dao_frontend
npm install
npm run build
cd ../..

echo "🌐 Deploying frontend..."
dfx deploy cerebrum_frontend

echo "✨ Deployment complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Frontend will be available at: http://localhost:4943/?canisterId=$(dfx canister id cerebrum_frontend)"
echo "2. Start frontend development server: cd src/dao_frontend && npm run dev"
