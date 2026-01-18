#!/bin/bash

# Vercel Deployment Script
# Run this after completing 'vercel login'

echo "🚀 Deploying to Vercel..."
echo ""

# Deploy to production
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo "Your site should be live at the URL shown above."

