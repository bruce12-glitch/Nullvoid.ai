# Start the NullVoid.AI Next.js app.
#
# Usage:
#   .\run.ps1          # start dev server on port 3000 (or next free port)
#   .\run.ps1 -Prod    # build + start production server
#   .\run.ps1 -Port 3100
#
# This script:
#   1. Kills any stale Next.js servers from this project.
#   2. Checks whether port 3000 is free.
#   3. Warns if VS Code's Live Preview is holding port 3000 (the "Index of /"
#      listing you were seeing) and picks the next free port instead.

param(
    [switch]$Prod,
    [int]$Port = 3000
)

$ErrorActionPreference = "Continue"

Write-Host "=== NullVoid.AI launcher ===" -ForegroundColor Cyan

# 1. Kill stale Next.js processes for this project
$stale = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match "NULLVOID.AI.*(next|start-server)" -or $_.CommandLine -match "next dev|next start" }
foreach ($p in $stale) {
    Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
    Write-Host "Killed stale Next.js process PID $($p.ProcessId)" -ForegroundColor Yellow
}

Start-Sleep -Milliseconds 800

# 2. Probe the requested port
function Test-Port([int]$p) {
    return [bool](Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue)
}

$targetPort = $Port
while (Test-Port $targetPort) {
    $owner = Get-NetTCPConnection -LocalPort $targetPort -State Listen -ErrorAction SilentlyContinue |
        Select-Object -First 1 -ExpandProperty OwningProcess
    $proc = Get-Process -Id $owner -ErrorAction SilentlyContinue
    $name = if ($proc) { $proc.ProcessName } else { "PID $owner" }

    if ($name -eq "Code") {
        Write-Host "Port $targetPort is held by VS Code's Live Preview (this is the 'Index of /' page)." -ForegroundColor Red
        Write-Host "Close it in VS Code: View -> Command Palette -> 'Live Preview: Stop Server', or close the preview tab." -ForegroundColor Yellow
    } else {
        Write-Host "Port $targetPort is in use by $name. Trying next port..." -ForegroundColor Yellow
    }
    $targetPort++
}

Write-Host "Starting on port $targetPort" -ForegroundColor Green
if ($Prod) {
    npm run build
    if ($LASTEXITCODE -ne 0) { exit 1 }
    npx next start -p $targetPort
} else {
    npm run dev -- -p $targetPort
}
