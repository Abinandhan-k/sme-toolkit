# SME Toolkit - One-Click Deployment Script (PowerShell)
# This script automates: Git setup, GitHub push, and Vercel deployment prep

$ErrorActionPreference = "Stop"

Write-Host "SME Toolkit Deployment Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git not found. Please install Git from https://git-scm.com" -ForegroundColor Red
    exit 1
}

# Get GitHub info
Write-Host "GitHub Details:" -ForegroundColor Yellow
$GITHUB_USERNAME = Read-Host -Prompt 'GitHub Username'
$REPO_NAME = Read-Host -Prompt 'Repository name (default: sme-toolkit)'
if ([string]::IsNullOrEmpty($REPO_NAME)) { $REPO_NAME = "sme-toolkit" }

# Ask for Supabase credentials so user can run locally
Write-Host "" 
Write-Host "Supabase configuration (for local .env)" -ForegroundColor Yellow
$SB_URL = Read-Host -Prompt 'Supabase URL (e.g. https://xyz.supabase.co)'
$SB_KEY = Read-Host -Prompt 'Supabase anon/public key'
if (-not [string]::IsNullOrEmpty($SB_URL) -and -not [string]::IsNullOrEmpty($SB_KEY)) {
    $envFile = ".env"
    Write-Host "Writing credentials to $envFile (will not be committed if .gitignore covers it)" -ForegroundColor Green
    $content = "VITE_SUPABASE_URL=$SB_URL`nVITE_SUPABASE_ANON_KEY=$SB_KEY`n"
    $content | Out-File -FilePath $envFile -Encoding utf8 -Force
    if (-not (Select-String -Path .gitignore -Pattern "^\.env" -Quiet)) {
        "\.env" | Add-Content .gitignore
        Write-Host "Added .env to .gitignore" -ForegroundColor Green
    }
}

# Initialize Git
Write-Host ""
Write-Host "Setting up Git repository..." -ForegroundColor Cyan
git init
git add .
git commit -m "Initial commit: SME Toolkit - Production Ready"

# Create GitHub repo and push
Write-Host ""
Write-Host "Preparing GitHub repository..." -ForegroundColor Cyan
Write-Host "Repository: $GITHUB_USERNAME/$REPO_NAME" -ForegroundColor Yellow
Write-Host ""

# Setup remote
git remote remove origin 2>$null
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
git branch -M main

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "Authenticating with GitHub (use your personal access token)..." -ForegroundColor Yellow
Write-Host ""

git push -u origin main

Write-Host ""
Write-Host "GitHub repository created!" -ForegroundColor Green
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Next: Deploy to Vercel" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Step 1: Go to https://vercel.com/new" -ForegroundColor Yellow
Write-Host "Step 2: Click 'Import Git Repository'" -ForegroundColor Yellow
Write-Host "Step 3: Paste URL:" -ForegroundColor Yellow
Write-Host ('        https://github.com/{0}/{1}' -f $GITHUB_USERNAME, $REPO_NAME) -ForegroundColor White
Write-Host ""
Write-Host "Step 4: Add Environment Variables:" -ForegroundColor Yellow
Write-Host "        VITE_SUPABASE_URL = https://your-project.supabase.co" -ForegroundColor White
Write-Host "        VITE_SUPABASE_ANON_KEY = your-anon-key-here" -ForegroundColor White
Write-Host "        VITE_GOOGLE_CLIENT_ID = xxx.apps.googleusercontent.com (optional)" -ForegroundColor White
Write-Host ""
Write-Host "Step 5: Click Deploy" -ForegroundColor Yellow
Write-Host ""
Write-Host "Your app will be live in 2-3 minutes!" -ForegroundColor Green
Write-Host ""
Write-Host "GitHub:" -ForegroundColor Cyan
Write-Host ('https://github.com/{0}/{1}' -f $GITHUB_USERNAME, $REPO_NAME) -ForegroundColor White
Write-Host ""
