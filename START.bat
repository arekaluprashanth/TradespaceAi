@echo off
REM TradespaceAi - Startup Script for Windows
REM This script starts both the server and client

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║         TradespaceAi - Full Stack Application             ║
echo ║          Starting Backend and Frontend Servers             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

REM Check if node_modules exists in root
if not exist "node_modules\" (
    echo Installing root dependencies...
    call npm.cmd install
)

REM Check if server node_modules exists
if not exist "server\node_modules\" (
    echo Installing server dependencies...
    cd server
    call npm.cmd install
    cd ..
)

REM Check if client node_modules exists
if not exist "client\node_modules\" (
    echo Installing client dependencies...
    cd client
    call npm.cmd install
    cd ..
)

echo.
echo ✓ All dependencies installed
echo.
echo Starting servers...
echo.

REM Start both servers using npm run dev
call npm.cmd run dev

pause
