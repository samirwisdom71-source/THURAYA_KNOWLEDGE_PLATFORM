param(
  [string]$Source,
  [string]$ThurayaRoot,
  [string]$ReleaseId = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')
)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $here '_common.ps1')
$paths = Get-ThurayaPaths $ThurayaRoot
Initialize-ThurayaDirectories $paths

if (-not $Source) { $Source = (Resolve-Path (Join-Path $here '..\..')).Path }
$Source = (Resolve-Path $Source).Path
if (-not (Test-Path $paths.EnvFile)) { throw "Create $($paths.EnvFile) from deploy/windows-iis/.env.production.example first." }

Import-DotEnvFile $paths.EnvFile
$env:STORAGE_DIR = $paths.Storage
$env:BACKUP_ROOT = $paths.Backups
$previous = Get-CurrentReleaseTarget $paths
$releaseDir = Join-Path $paths.Releases $ReleaseId
$runDir = Join-Path $releaseDir 'run'

Write-Host "1/8 Backup"
& (Join-Path $here 'backup.ps1') -ThurayaRoot $paths.Root

Write-Host "2/8 Copy source to $releaseDir"
New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null
$xd = @('node_modules', '.next', '.git', 'source_package_v1.0', 'storage', 'backups', 'deploy')
robocopy $Source $releaseDir /E /XD $xd /XF '.env' '.env.local' /NFL /NDL /NJH /NJS /np | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit $LASTEXITCODE" }

Write-Host "3/8 Install dependencies"
Push-Location $releaseDir
try {
  $env:Path = "C:\Users\ASUS\AppData\Local\Python\bin;" + $env:Path
  npm install --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { throw 'npm install failed' }

  Write-Host "4/8 Migrate"
  node scripts/preflight.mjs
  if ($LASTEXITCODE -ne 0) { throw 'preflight failed' }
  node scripts/db-migrate.mjs
  if ($LASTEXITCODE -ne 0) { throw 'migration failed' }

  Write-Host "5/8 Build"
  npm run build
  if ($LASTEXITCODE -ne 0) { throw 'build failed' }
} finally {
  Pop-Location
}

Write-Host "Assemble standalone runtime"
$standalone = Join-Path $releaseDir '.next\standalone'
if (-not (Test-Path (Join-Path $standalone 'server.js'))) { throw 'standalone server.js is missing. next.config must keep output: standalone.' }
New-Item -ItemType Directory -Force -Path $runDir | Out-Null
robocopy $standalone $runDir /E /NFL /NDL /NJH /NJS /np | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $runDir '.next\static') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $runDir 'public') | Out-Null
robocopy (Join-Path $releaseDir '.next\static') (Join-Path $runDir '.next\static') /E /NFL /NDL /NJH /NJS /np | Out-Null
if (Test-Path (Join-Path $releaseDir 'public')) {
  robocopy (Join-Path $releaseDir 'public') (Join-Path $runDir 'public') /E /NFL /NDL /NJH /NJS /np | Out-Null
}
foreach ($extra in @('db', 'scripts', 'content\generated')) {
  $from = Join-Path $releaseDir $extra
  if (Test-Path $from) {
    robocopy $from (Join-Path $runDir $extra) /E /NFL /NDL /NJH /NJS /np | Out-Null
  }
}

# Next standalone tracing often omits libvips DLLs next to sharp-win32-x64.node.
$sharpLibFrom = Join-Path $releaseDir 'node_modules\@img\sharp-win32-x64\lib'
$sharpLibTo = Join-Path $runDir 'node_modules\@img\sharp-win32-x64\lib'
if (Test-Path $sharpLibFrom) {
  New-Item -ItemType Directory -Force -Path $sharpLibTo | Out-Null
  Copy-Item (Join-Path $sharpLibFrom '*') $sharpLibTo -Force
} else {
  Write-Warning "sharp Windows native lib folder not found: $sharpLibFrom"
}

Copy-Item (Join-Path $here 'web.config') (Join-Path $paths.Iis 'web.config') -Force
$ops = Join-Path $paths.App 'windows-iis'
New-Item -ItemType Directory -Force -Path $ops | Out-Null
Copy-Item (Join-Path $here '*') $ops -Force

Write-Host "6/8 Stop service"
& (Join-Path $here 'stop-production.ps1') -ThurayaRoot $paths.Root

Write-Host "7/8 Switch current release"
Set-CurrentRelease -Paths $paths -Target $runDir

Write-Host "8/8 Start and health-check"
$svc = Get-ServiceState $paths.ServiceId
if ($svc) { Start-Service -Name $paths.ServiceId } else {
  & (Join-Path $here 'start-production.ps1') -ThurayaRoot $paths.Root
}

$healthy = $false
for ($i = 0; $i -lt 20; $i++) {
  Start-Sleep -Seconds 2
  if (Test-ThurayaHealth $paths.HealthUrl) { $healthy = $true; break }
}

if ($healthy) {
  Write-Host "DEPLOY OK  release=$ReleaseId"
  Write-Host "Current -> $runDir"
  exit 0
}

Write-Host 'HEALTH CHECK FAILED after switch.'
if ($previous -and (Test-Path $previous)) {
  Write-Host "Keeping the failed release at $runDir"
  Write-Host "Rollback:"
  Write-Host "  $(Join-Path $here 'stop-production.ps1') -ThurayaRoot $($paths.Root)"
  Write-Host "  Remove-Item $($paths.Current) -Force"
  Write-Host "  New-Item -ItemType Junction -Path $($paths.Current) -Target '$previous'"
  Write-Host "  $(Join-Path $here 'start-production.ps1') -ThurayaRoot $($paths.Root)"
  Write-Host "The previous release was not deleted: $previous"
} else {
  Write-Host 'No previous release is available to roll back to automatically.'
}
exit 1
