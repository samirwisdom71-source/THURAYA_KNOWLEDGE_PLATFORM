param(
  [string]$ThurayaRoot
)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $here '_common.ps1')
$paths = Get-ThurayaPaths $ThurayaRoot

$svc = Get-ServiceState $paths.ServiceId
if ($svc -and $svc.Status -eq 'Running') {
  Stop-Service -Name $paths.ServiceId -Force
  Write-Host "Stopped Windows service $($paths.ServiceId)"
  exit 0
}

if (Test-Path $paths.PidFile) {
  $procId = (Get-Content $paths.PidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
  if ($procId) {
    Stop-Process -Id ([int]$procId) -Force -ErrorAction SilentlyContinue
  }
  Remove-Item $paths.PidFile -Force -ErrorAction SilentlyContinue
}

Get-NetTCPConnection -LocalPort $paths.Port -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalAddress -in @('127.0.0.1', '::1') } |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

Write-Host "Stopped production listener on 127.0.0.1:$($paths.Port)"
