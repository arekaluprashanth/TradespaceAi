@echo off
echo ============================================
echo    TradespaceAI - Build and Export
echo ============================================
echo.

set "PROJECT_ROOT=%~dp0"
set "EXPORT_DIR=%PROJECT_ROOT%export"

REM Parse arguments
set "DOCKER_ONLY=0"
set "DIST_ONLY=0"
if "%1"=="--docker-only" set "DOCKER_ONLY=1"
if "%1"=="--dist-only" set "DIST_ONLY=1"

REM --- 1. Build Static Dist ZIP ---
if "%DOCKER_ONLY%"=="1" goto :skip_dist

echo.
echo -- Building Static Dist ZIP --
echo.

echo ^> Installing client dependencies...
cd /d "%PROJECT_ROOT%client"
call npm install
if errorlevel 1 (
    echo   [FAIL] npm install failed
    exit /b 1
)
echo   [OK] Dependencies installed

echo ^> Building client (vite build)...
call npm run build
if errorlevel 1 (
    echo   [FAIL] Build failed
    exit /b 1
)
echo   [OK] Client built successfully

cd /d "%PROJECT_ROOT%"

if not exist "client\dist" (
    echo   [FAIL] client\dist not found after build!
    exit /b 1
)

if not exist "%EXPORT_DIR%" mkdir "%EXPORT_DIR%"
if exist "%EXPORT_DIR%\tradespaceai-dist.zip" del "%EXPORT_DIR%\tradespaceai-dist.zip"

echo ^> Creating ZIP archive...
powershell -NoProfile -Command "Compress-Archive -Path 'client\dist\*' -DestinationPath '%EXPORT_DIR%\tradespaceai-dist.zip' -Force"
echo   [OK] Dist ZIP created: export\tradespaceai-dist.zip
echo.
echo   Upload this ZIP directly to Netlify or Vercel:
echo     Netlify: Drag and drop at app.netlify.com/drop
echo     Vercel:  npx vercel deploy --prebuilt
echo.

:skip_dist

REM --- 2. Build Docker Images ---
if "%DIST_ONLY%"=="1" goto :skip_docker

echo.
echo -- Building Docker Images --
echo.

docker info >nul 2>&1
if errorlevel 1 (
    echo   [FAIL] Docker is not running. Start Docker Desktop and try again.
    exit /b 1
)

set "DOCKER_EXPORT=%EXPORT_DIR%\docker"
if not exist "%DOCKER_EXPORT%" mkdir "%DOCKER_EXPORT%"

cd /d "%PROJECT_ROOT%"

echo ^> Building server image (tradespaceai-server)...
docker build -t tradespaceai-server:latest -f docker/Dockerfile.server .
if errorlevel 1 ( echo   [FAIL] Server image build failed! && exit /b 1 )
echo   [OK] Server image built

echo ^> Building client image (tradespaceai-client)...
docker build -t tradespaceai-client:latest -f docker/Dockerfile.client .
if errorlevel 1 ( echo   [FAIL] Client image build failed! && exit /b 1 )
echo   [OK] Client image built

echo ^> Exporting server image to tar...
docker save -o "%DOCKER_EXPORT%\tradespaceai-server.tar" tradespaceai-server:latest
echo   [OK] Server tar: export\docker\tradespaceai-server.tar

echo ^> Exporting client image to tar...
docker save -o "%DOCKER_EXPORT%\tradespaceai-client.tar" tradespaceai-client:latest
echo   [OK] Client tar: export\docker\tradespaceai-client.tar

copy "%PROJECT_ROOT%docker\docker-compose.yml" "%DOCKER_EXPORT%\" >nul
copy "%PROJECT_ROOT%docker\nginx.conf" "%DOCKER_EXPORT%\" >nul
echo   [OK] Copied docker-compose.yml and nginx.conf

echo.
echo   To deploy on any server:
echo     1. Copy the export\docker\ folder to your server
echo     2. docker load -i tradespaceai-server.tar
echo     3. docker load -i tradespaceai-client.tar
echo     4. docker compose up -d
echo.

:skip_docker

echo.
echo ============================================
echo    Export Complete!
echo ============================================
echo.
echo   Output directory: %EXPORT_DIR%
echo.
