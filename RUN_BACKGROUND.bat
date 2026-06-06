@echo off
setlocal enabledelayedexpansion

REM =========================================================
REM   TradespaceAi - Persistent Background Service
REM   Runs the app in background even after closing VS Code
REM =========================================================

color 0A
cls

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          TradespaceAi - Background Service                 ║
echo ║         Starting in Independent Terminals...               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

REM Check Node.js
where /q node
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not installed!
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo [✓] Node.js detected
echo.

REM Install dependencies if needed
if not exist "node_modules\" (
    echo [*] Installing dependencies...
    call npm install
)

if not exist "server\node_modules\" (
    echo [*] Installing server packages...
    cd server
    call npm install
    cd ..
)

if not exist "client\node_modules\" (
    echo [*] Installing client packages...
    cd client
    call npm install
    cd ..
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║              Starting Services...                          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Start Backend in separate window
echo [*] Starting Backend Server (port 3001)...
start "TradespaceAi - Backend Server" cmd /k cd /d "%cd%\server" ^& npm run dev

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak

REM Start Frontend in separate window
echo [*] Starting Frontend App (port 5173)...
start "TradespaceAi - Frontend App" cmd /k cd /d "%cd%\client" ^& npm run dev

REM Wait for frontend to start
timeout /t 3 /nobreak

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                Services Started!                           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo [✓] Backend Server:  http://localhost:3001
echo [✓] Frontend App:    http://localhost:5173
echo.
echo [✓] Two terminal windows should have opened
echo [✓] Both services will continue running in background
echo [✓] You can close VS Code - services will keep running
echo [✓] You can close this window too
echo.
echo To stop the services:
echo   - Close the backend terminal window
echo   - Close the frontend terminal window
echo.
timeout /t 5

REM Close this window
exit /b 0
