# Shared helpers for Thuraya Windows/IIS production scripts.
# Do not print environment values; they may contain secrets.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-ThurayaRoot {
  param([string]$Override)
  if ($Override) { return $Override }
  if ($env:THURAYA_ROOT) { return $env:THURAYA_ROOT }
  return 'C:\Thuraya'
}

function Get-ThurayaPaths {
  param([string]$ThurayaRoot)
  $root = Get-ThurayaRoot $ThurayaRoot
  [pscustomobject]@{
    Root       = $root
    App        = Join-Path $root 'app'
    Iis        = Join-Path $root 'app\iis'
    Releases   = Join-Path $root 'releases'
    Current    = Join-Path $root 'current'
    Storage    = Join-Path $root 'storage'
    Backups    = Join-Path $root 'backups'
    Logs       = Join-Path $root 'logs'
    EnvFile    = Join-Path $root '.env'
    PidFile    = Join-Path $root 'logs\thuraya.pid'
    ServiceId  = 'ThurayaKnowledge'
    ListenHost = '127.0.0.1'
    Port       = 3000
    HealthUrl  = 'http://127.0.0.1:3000/api/health'
  }
}

function Initialize-ThurayaDirectories {
  param($Paths)
  foreach ($dir in @($Paths.App, $Paths.Iis, $Paths.Releases, $Paths.Storage, (Join-Path $Paths.Storage 'private'), (Join-Path $Paths.Storage 'public'), $Paths.Backups, $Paths.Logs)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }
}

function Import-DotEnvFile {
  param([string]$Path)
  if (-not (Test-Path $Path)) { throw "Environment file not found: $Path" }
  Get-Content -LiteralPath $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) { return }
    $i = $line.IndexOf('=')
    if ($i -lt 1) { return }
    $name = $line.Substring(0, $i).Trim()
    $value = $line.Substring($i + 1)
    if ($name) { Set-Item -Path "Env:$name" -Value $value }
  }
}

function Get-DotEnvValue {
  param([string]$Path, [string]$Key)
  if (-not (Test-Path $Path)) { return $null }
  foreach ($line in Get-Content -LiteralPath $Path) {
    if ($line -match "^\s*$([regex]::Escape($Key))=(.*)$") { return $Matches[1] }
  }
  return $null
}

function Get-NodeExecutable {
  $cmd = Get-Command node -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  foreach ($candidate in @(
      'C:\Program Files\nodejs\node.exe',
      'C:\nvm4w\nodejs\node.exe'
    )) {
    if (Test-Path $candidate) { return $candidate }
  }
  throw 'node.exe was not found. Install Node.js 20.9+ and add it to PATH.'
}

function Get-PsqlBin {
  foreach ($ver in @('17', '16', '15', '18')) {
    $bin = "C:\Program Files\PostgreSQL\$ver\bin"
    if (Test-Path (Join-Path $bin 'pg_dump.exe')) { return $bin }
  }
  $cmd = Get-Command pg_dump -ErrorAction SilentlyContinue
  if ($cmd) { return [IO.Path]::GetDirectoryName($cmd.Source) }
  throw 'PostgreSQL client tools (pg_dump/pg_restore) were not found.'
}

function Test-ThurayaHealth {
  param([string]$Url = 'http://127.0.0.1:3000/api/health', [int]$TimeoutSec = 20)
  try {
    $res = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec $TimeoutSec
    $json = $res.Content | ConvertFrom-Json
    return ($res.StatusCode -eq 200 -and $json.status -eq 'ok' -and $json.database -eq 'ok')
  } catch {
    return $false
  }
}

function Get-CurrentReleaseTarget {
  param($Paths)
  if (-not (Test-Path $Paths.Current)) { return $null }
  $item = Get-Item $Paths.Current -Force
  if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { return $item.Target }
  return $item.FullName
}

function Set-CurrentRelease {
  param($Paths, [string]$Target)
  if (Test-Path $Paths.Current) { Remove-Item -LiteralPath $Paths.Current -Force -Recurse -ErrorAction SilentlyContinue }
  New-Item -ItemType Junction -Path $Paths.Current -Target $Target | Out-Null
}

function Get-ServiceState {
  param([string]$Name)
  return Get-Service -Name $Name -ErrorAction SilentlyContinue
}
