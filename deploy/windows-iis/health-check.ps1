param(
  [string]$ThurayaRoot,
  [string]$Url,
  [int]$TimeoutSec = 20
)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $here '_common.ps1')
$paths = Get-ThurayaPaths $ThurayaRoot
if (-not $Url) { $Url = $paths.HealthUrl }
$ok = Test-ThurayaHealth -Url $Url -TimeoutSec $TimeoutSec
if ($ok) {
  Write-Host "HEALTH OK  $Url"
  exit 0
}
Write-Host "HEALTH FAILED  $Url"
exit 1
