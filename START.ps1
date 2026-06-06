#!/usr/bin/env pwsh
# TradespaceAi - PowerShell Startup Script

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         TradespaceAi - Full Stack Application             ║" -ForegroundColor Cyan
Write-Host "║          Starting Backend and Frontend Servers             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

# Check and install root dependencies
if (-Not (Test-Path "node_modules")) {
    Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
    npm.cmd install
}

# Check and install server dependencies
if (-Not (Test-Path "server\node_modules")) {
    Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
    Set-Location server
    npm.cmd install
    Set-Location ..
}

# Check and install client dependencies
if (-Not (Test-Path "client\node_modules")) {
    Write-Host "📦 Installing client dependencies..." -ForegroundColor Yellow
    Set-Location client
    npm.cmd install
    Set-Location ..
}

Write-Host "✓ All dependencies installed" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting servers..." -ForegroundColor Cyan
Write-Host ""

# Start servers
npm.cmd run dev

Read-Host "Press Enter to exit"
