#!/bin/bash
# SME Toolkit - One-Click Deployment Script
# This script automates: Git setup, GitHub push, and Vercel deployment prep

set -e

echo "🚀 SME Toolkit Deployment Script"
echo "=================================="
echo ""

# Check prerequisites
if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install Git."
    exit 1
fi

# Get GitHub info from user
echo "📝 Please provide your GitHub details:"
read -p "GitHub Username (e.g., your-username): " GITHUB_USERNAME
read -p "Repository name (default: sme-toolkit): " REPO_NAME
REPO_NAME=${REPO_NAME:-sme-toolkit}

# Initialize Git
echo ""
echo "📦 Setting up Git repository..."
git init
git add .
git commit -m "Initial commit: SME Toolkit - Production Ready"

# Create GitHub repo and push
echo ""
echo "🔗 Creating GitHub repository..."
echo "⚠️  You'll be prompted to authenticate with GitHub"
echo ""
echo "Creating repo: $GITHUB_USERNAME/$REPO_NAME"
echo ""

# Initialize git if not already done
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
git branch -M main

echo ""
echo "📤 Pushing to GitHub..."
echo "Note: You'll be prompted for your GitHub token/password"
echo ""
git push -u origin main

echo ""
echo "✅ GitHub setup complete!"
echo ""
echo "=================================="
echo "🎉 Next Steps - Deploy to Vercel:"
echo "=================================="
echo ""
echo "1. Go to: https://vercel.com/new"
echo "2. Click 'Import Git Repository'"
echo "3. Paste this URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo "4. Select 'Vite' as framework (auto-detected)"
echo "5. Add Environment Variables:"
echo ""
echo "   VITE_SUPABASE_URL = https://your-project.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY = your-anon-key-here"
echo "   VITE_GOOGLE_CLIENT_ID = xxx.apps.googleusercontent.com (optional)"
echo ""
echo "6. Click 'Deploy'"
echo "7. Wait 2-3 minutes for build to complete"
echo ""
echo "Your app will be live at: https://sme-toolkit.vercel.app"
echo ""
echo "=================================="
echo "📋 GitHub Repository:"
echo "https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo "=================================="
