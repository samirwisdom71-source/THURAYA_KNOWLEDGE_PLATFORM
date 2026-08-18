param(
  [string]$ThurayaRoot
)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $here '_common.ps1')
$paths = Get-ThurayaPaths $ThurayaRoot
Initialize-ThurayaDirectories $paths
Import-DotEnvFile $paths.EnvFile

if (-not $env:DATABASE_URL) { throw 'DATABASE_URL is missing from D:\Thuraya\.env' }
$storage = if ($env:STORAGE_DIR) { $env:STORAGE_DIR } else { $paths.Storage }
$backupRoot = if ($env:BACKUP_ROOT) { $env:BACKUP_ROOT } else { $paths.Backups }
$stamp = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')
$out = Join-Path $backupRoot "thuraya-$stamp"
New-Item -ItemType Directory -Force -Path $out | Out-Null

$bin = Get-PsqlBin
$env:Path = "$bin;" + $env:Path
$dump = Join-Path $out 'database.dump'
& (Join-Path $bin 'pg_dump.exe') $env:DATABASE_URL --format=custom --no-owner --file=$dump
if ($LASTEXITCODE -ne 0) { throw 'pg_dump failed' }

$storageZip = Join-Path $out 'storage.zip'
if (Test-Path $storage) {
  Compress-Archive -Path (Join-Path $storage '*') -DestinationPath $storageZip -Force
} else {
  Compress-Archive -Path $out -DestinationPath $storageZip -Force
}

$meta = @{
  created_at_utc = $stamp
  hostname = $env:COMPUTERNAME
  site_url = $env:SITE_URL
  app_env = $env:APP_ENV
  storage_dir = $storage
  listen_host = $env:LISTEN_HOST
  env_keys = @()
}
Get-Content $paths.EnvFile | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
  $k = $_.Split('=',2)[0]
  if ($k) { $meta.env_keys += $k }
}
$meta | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $out 'config.metadata.json') -Encoding UTF8
Copy-Item (Join-Path $here '.env.production.example') (Join-Path $out 'env.schema.example') -Force
Copy-Item $paths.EnvFile (Join-Path $out 'env.runtime') -Force

Get-FileHash -Algorithm SHA256 -Path $dump, $storageZip |
  ForEach-Object { "$($_.Hash.ToLower())  $($_.Path | Split-Path -Leaf)" } |
  Set-Content (Join-Path $out 'SHA256SUMS') -Encoding ascii

Write-Host "Backup created: $out"
Write-Host 'The env.runtime copy is sensitive. Restrict NTFS permissions on D:\Thuraya\backups.'
