param(
  [Parameter(Mandatory = $true)][string]$RestoreFrom,
  [string]$ThurayaRoot,
  [switch]$ConfirmRestore
)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $here '_common.ps1')
$paths = Get-ThurayaPaths $ThurayaRoot

Write-Host 'RESTORE IS DESTRUCTIVE.'
Write-Host 'It overwrites the PostgreSQL database and D:\Thuraya\storage.'
Write-Host 'It does not run unless you pass -ConfirmRestore and type YES below.'

if (-not $ConfirmRestore) { throw 'Refusing to restore: add -ConfirmRestore' }
$answer = Read-Host 'Type YES to overwrite the live database and storage'
if ($answer -ne 'YES') { throw 'Restore cancelled' }

if (-not (Test-Path $paths.EnvFile)) { throw "Missing $($paths.EnvFile)" }
Import-DotEnvFile $paths.EnvFile
if (-not $env:DATABASE_URL) { throw 'DATABASE_URL is missing' }

$dump = Join-Path $RestoreFrom 'database.dump'
$storageZip = Join-Path $RestoreFrom 'storage.zip'
if (-not (Test-Path $dump)) { throw "database.dump not found in $RestoreFrom" }
if (-not (Test-Path $storageZip)) { throw "storage.zip not found in $RestoreFrom" }

$sum = Join-Path $RestoreFrom 'SHA256SUMS'
if (Test-Path $sum) {
  Get-Content $sum | ForEach-Object {
    $hash, $name = $_ -split '\s+', 2
    $file = Join-Path $RestoreFrom $name.Trim()
    $actual = (Get-FileHash -Algorithm SHA256 -Path $file).Hash
    if ($actual.ToLower() -ne $hash.ToLower()) { throw "Checksum mismatch for $name" }
  }
}

$bin = Get-PsqlBin
$storage = if ($env:STORAGE_DIR) { $env:STORAGE_DIR } else { $paths.Storage }
& (Join-Path $here 'stop-production.ps1') -ThurayaRoot $paths.Root

& (Join-Path $bin 'pg_restore.exe') --clean --if-exists --no-owner --dbname=$env:DATABASE_URL $dump
if ($LASTEXITCODE -ne 0) { throw 'pg_restore failed' }

New-Item -ItemType Directory -Force -Path $storage | Out-Null
Remove-Item -Recurse -Force (Join-Path $storage 'private') -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force (Join-Path $storage 'public') -ErrorAction SilentlyContinue
Expand-Archive -LiteralPath $storageZip -DestinationPath $storage -Force

Write-Host "Restore completed from $RestoreFrom"
Write-Host 'Start the service and run health-check.ps1 before returning traffic.'
