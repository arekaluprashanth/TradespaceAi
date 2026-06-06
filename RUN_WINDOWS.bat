@echo off
setlocal enabledelayedexpansion

REM =========================================================
REM   TradespaceAi - Standalone Startup Script
REM   Works independently without Visual Studio Code
REM =========================================================

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          TradespaceAi - Complete Trading Platform         ║
echo ║              Initializing Application...                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Get the project directory
cd /d "%~dp0"
set PROJECT_DIR=%cd%

echo [*] Project Location: %PROJECT_DIR%
echo.

REM Check if Node.js is installed
where /q node
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [✓] Node.js detected: %NODE_VERSION%

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [✓] npm detected: %NPM_VERSION%
echo.

REM Install root dependencies
if not exist "node_modules\" (
    echo [*] Installing root dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install root dependencies
        pause
        exit /b 1
    )
    echo [✓] Root dependencies installed
) else (
    echo [✓] Root dependencies already installed
)

REM Install server dependencies
if not exist "server\node_modules\" (
    echo [*] Installing server dependencies...
    cd server
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install server dependencies
        pause
        exit /b 1
    )
    cd ..
    echo [✓] Server dependencies installed
) else (
    echo [✓] Server dependencies already installed
)

REM Install client dependencies
if not exist "client\node_modules\" (
    echo [*] Installing client dependencies...
    cd client
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install client dependencies
        pause
        exit /b 1
    )
    cd ..
    echo [✓] Client dependencies installed
) else (
    echo [✓] Client dependencies already installed
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                 Starting Servers...                        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo [*] Backend Server: http://localhost:3001
echo [*] Frontend App:   http://localhost:5173
echo.
echo [*] Network Access: Replace localhost with your IP address
echo [*] Run "ipconfig" in another terminal to find your IP
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start both servers
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to start servers
    pause
    exit /b 1
)

pause
