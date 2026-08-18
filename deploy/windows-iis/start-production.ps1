param(
  [string]$ThurayaRoot,
  [string]$AppRoot,
  [switch]$Foreground,
  [switch]$LocalProject
)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $here '_common.ps1')
$paths = Get-ThurayaPaths $ThurayaRoot
Initialize-ThurayaDirectories $paths

if ($LocalProject) {
  $AppRoot = (Resolve-Path (Join-Path $here '..\..')).Path
  $envFile = Join-Path $AppRoot '.env'
} else {
  if (-not $AppRoot) { $AppRoot = $paths.Current }
  $envFile = $paths.EnvFile
}

if (-not (Test-Path $AppRoot)) { throw "Application root not found: $AppRoot" }
Import-DotEnvFile $envFile

$listenHost = if ($env:LISTEN_HOST) { $env:LISTEN_HOST } else { $paths.ListenHost }
$port = if ($env:PORT) { $env:PORT } else { [string]$paths.Port }
$env:HOSTNAME = $listenHost
$env:PORT = $port
if (-not $env:STORAGE_DIR) { $env:STORAGE_DIR = $paths.Storage }

if ($listenHost -ne '127.0.0.1' -and $env:APP_ENV -eq 'production') {
  Write-Warning "LISTEN_HOST is $listenHost. Production should bind 127.0.0.1 so IIS is the only public entry."
}

$node = Get-NodeExecutable
$standalone = Join-Path $AppRoot 'server.js'
$nextBin = Join-Path $AppRoot 'node_modules\next\dist\bin\next'

if (Test-Path $standalone) {
  $exe = $node
  $argList = @('server.js')
  $workDir = $AppRoot
} elseif (Test-Path $nextBin) {
  $exe = $node
  $argList = @($nextBin, 'start', '--hostname', $listenHost, '--port', $port)
  $workDir = $AppRoot
} else {
  throw "Neither standalone server.js nor next start is available in $AppRoot. Run a production build first."
}

if (-not $Foreground) {
  $existing = Get-NetTCPConnection -LocalAddress $listenHost -LocalPort ([int]$port) -ErrorAction SilentlyContinue
  if ($existing) { Write-Host "Already listening on ${listenHost}:${port}"; exit 0 }
}

$logOut = Join-Path $paths.Logs 'app.out.log'
$logErr = Join-Path $paths.Logs 'app.err.log'
New-Item -ItemType Directory -Force -Path $paths.Logs | Out-Null

Set-Location $workDir
$migrate = Join-Path $workDir 'scripts\db-migrate.mjs'
if (Test-Path $migrate) {
  Write-Host 'Running database migrate (creates DB only if missing, skips applied migrations)'
  & $node $migrate
  if ($LASTEXITCODE -ne 0) { throw 'db-migrate failed' }
  $seed = Join-Path $workDir 'scripts\db-seed.mjs'
  $admin = Join-Path $workDir 'scripts\create-admin.mjs'
  if (Test-Path $seed) { & $node $seed; if ($LASTEXITCODE -ne 0) { throw 'db-seed failed' } }
  if (Test-Path $admin) { & $node $admin; if ($LASTEXITCODE -ne 0) { throw 'create-admin failed' } }
}

if ($Foreground) {
  & $exe @argList
  exit $LASTEXITCODE
}

$proc = Start-Process -FilePath $exe -ArgumentList $argList -WorkingDirectory $workDir -WindowStyle Hidden -RedirectStandardOutput $logOut -RedirectStandardError $logErr -PassThru
Set-Content -LiteralPath $paths.PidFile -Value $proc.Id -Encoding ascii
Write-Host "Started PID $($proc.Id) on ${listenHost}:${port}"
