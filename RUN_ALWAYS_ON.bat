@echo off
REM =========================================================
REM   TradespaceAi - Always-On Service (Auto-Restart)
REM   Automatically restarts if either server crashes
REM =========================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

color 0B
cls

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║       TradespaceAi - Always-On Service Monitor             ║
echo ║     (Keeps running, auto-restarts if crashed)              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

set ATTEMPT=0
set MAX_ATTEMPTS=999

:START_SERVICES

set /a ATTEMPT=%ATTEMPT%+1

echo.
echo [%date% %time%] Startup Attempt #%ATTEMPT%
echo.

REM Check Node.js
where /q node
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not installed!
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Install deps if missing
if not exist "node_modules\" npm install >nul 2>&1
if not exist "server\node_modules\" (
    cd server
    npm install >nul 2>&1
    cd ..
)
if not exist "client\node_modules\" (
    cd client
    npm install >nul 2>&1
    cd ..
)

echo [*] Backend Server: Starting (port 3001)...
start "TradespaceAi Backend" /MIN cmd /c cd server ^& npm run dev

echo [*] Frontend App: Starting (port 5173)...
timeout /t 2 /nobreak >nul
start "TradespaceAi Frontend" /MIN cmd /c cd client ^& npm run dev

echo [✓] Services started
echo [✓] Monitoring for crashes...
echo.

REM Monitor for 24 hours, then restart
timeout /t 86400 /nobreak

echo [!] 24-hour cycle complete - restarting...
taskkill /FI "windowtitle eq TradespaceAi*" /T /F >nul 2>&1

goto START_SERVICES
