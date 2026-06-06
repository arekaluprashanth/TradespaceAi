<#
.SYNOPSIS
  Build and export TradespaceAI for deployment.
  Produces:
    1. Docker image tar files  -> export/docker/
    2. Static dist ZIP         -> export/tradespaceai-dist.zip
.NOTES
  Run from the project root: .\EXPORT_FOR_DEPLOY.ps1
  Requirements: Docker Desktop (for Docker images), Node.js 18+ (for dist ZIP)
#>

param(
    [switch]$DockerOnly,
    [switch]$DistOnly
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
if (-not $ProjectRoot) { $ProjectRoot = Get-Location }

$ExportDir = Join-Path $ProjectRoot "export"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   TradespaceAI - Build and Export"           -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# --- Helper ---
function Write-Step($msg) { Write-Host "> $msg" -ForegroundColor Yellow }
function Write-Done($msg) { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Err($msg)  { Write-Host "  [FAIL] $msg" -ForegroundColor Red }

# --- 1. Build Static Dist ZIP (for Netlify / Vercel) ---
if (-not $DockerOnly) {
    Write-Host ""
    Write-Host "-- Building Static Dist ZIP --" -ForegroundColor Magenta
    Write-Host ""

    Write-Step "Installing client dependencies..."
    $clientDir = Join-Path $ProjectRoot "client"
    cmd /c "cd /d `"$clientDir`" && npm install" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Err "npm install failed"
        exit 1
    }
    Write-Done "Dependencies installed"

    Write-Step "Building client (vite build)..."
    cmd /c "cd /d `"$clientDir`" && npm run build" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Build failed"
        exit 1
    }
    Write-Done "Client built successfully"

    $DistSource = Join-Path $ProjectRoot "client\dist"
    if (-not (Test-Path $DistSource)) {
        Write-Err "client/dist not found after build!"
        exit 1
    }

    # Create export directory
    if (-not (Test-Path $ExportDir)) { New-Item -ItemType Directory -Path $ExportDir | Out-Null }

    $ZipPath = Join-Path $ExportDir "tradespaceai-dist.zip"
    if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }

    Write-Step "Creating ZIP archive..."
    Compress-Archive -Path "$DistSource\*" -DestinationPath $ZipPath -Force
    $zipSize = [math]::Round((Get-Item $ZipPath).Length / 1MB, 2)
    Write-Done "Dist ZIP created: export\tradespaceai-dist.zip ($zipSize MB)"

    Write-Host ""
    Write-Host "  -> Upload this ZIP directly to Netlify/Vercel." -ForegroundColor Cyan
    Write-Host "     Netlify: Drag and drop at app.netlify.com/drop" -ForegroundColor DarkGray
    Write-Host "     Vercel:  npx vercel deploy --prebuilt" -ForegroundColor DarkGray
    Write-Host ""
}

# --- 2. Build Docker Images and Export as Tar ---
if (-not $DistOnly) {
    Write-Host ""
    Write-Host "-- Building Docker Images --" -ForegroundColor Magenta
    Write-Host ""

    # Check Docker is available
    $dockerCheck = cmd /c "docker info" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Docker is not running. Start Docker Desktop and try again."
        exit 1
    }

    $DockerExportDir = Join-Path $ExportDir "docker"
    if (-not (Test-Path $DockerExportDir)) { New-Item -ItemType Directory -Path $DockerExportDir | Out-Null }

    # Build server image
    Write-Step "Building server image (tradespaceai-server)..."
    cmd /c "cd /d `"$ProjectRoot`" && docker build -t tradespaceai-server:latest -f docker/Dockerfile.server ." 2>&1
    if ($LASTEXITCODE -ne 0) { Write-Err "Server image build failed!"; exit 1 }
    Write-Done "Server image built"

    # Build client image
    Write-Step "Building client image (tradespaceai-client)..."
    cmd /c "cd /d `"$ProjectRoot`" && docker build -t tradespaceai-client:latest -f docker/Dockerfile.client ." 2>&1
    if ($LASTEXITCODE -ne 0) { Write-Err "Client image build failed!"; exit 1 }
    Write-Done "Client image built"

    # Export as tar files
    Write-Step "Exporting server image to tar..."
    $ServerTar = Join-Path $DockerExportDir "tradespaceai-server.tar"
    cmd /c "docker save -o `"$ServerTar`" tradespaceai-server:latest" 2>&1
    $serverSize = [math]::Round((Get-Item $ServerTar).Length / 1MB, 2)
    Write-Done "Server tar: export\docker\tradespaceai-server.tar ($serverSize MB)"

    Write-Step "Exporting client image to tar..."
    $ClientTar = Join-Path $DockerExportDir "tradespaceai-client.tar"
    cmd /c "docker save -o `"$ClientTar`" tradespaceai-client:latest" 2>&1
    $clientSize = [math]::Round((Get-Item $ClientTar).Length / 1MB, 2)
    Write-Done "Client tar: export\docker\tradespaceai-client.tar ($clientSize MB)"

    # Copy compose and nginx config
    Copy-Item (Join-Path $ProjectRoot "docker\docker-compose.yml") $DockerExportDir -Force
    Copy-Item (Join-Path $ProjectRoot "docker\nginx.conf") $DockerExportDir -Force
    Write-Done "Copied docker-compose.yml and nginx.conf to export\docker\"

    Write-Host ""
    Write-Host "  -> To deploy on any server:" -ForegroundColor Cyan
    Write-Host "     1. Copy the export/docker/ folder to your server" -ForegroundColor DarkGray
    Write-Host "     2. docker load -i tradespaceai-server.tar" -ForegroundColor DarkGray
    Write-Host "     3. docker load -i tradespaceai-client.tar" -ForegroundColor DarkGray
    Write-Host "     4. docker compose up -d" -ForegroundColor DarkGray
    Write-Host ""
}

# --- Summary ---
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Export Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Output directory: $ExportDir" -ForegroundColor White

if (-not $DockerOnly) {
    Write-Host "    [ZIP] tradespaceai-dist.zip   - Netlify/Vercel upload" -ForegroundColor White
}
if (-not $DistOnly) {
    Write-Host "    [TAR] docker/                 - Docker tar images + compose" -ForegroundColor White
}
Write-Host ""
