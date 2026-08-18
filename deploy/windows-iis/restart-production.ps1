param(
  [string]$ThurayaRoot,
  [switch]$LocalProject
)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
& (Join-Path $here 'stop-production.ps1') -ThurayaRoot $ThurayaRoot
Start-Sleep -Seconds 2
$svc = Get-Service -Name 'ThurayaKnowledge' -ErrorAction SilentlyContinue
if ($svc) {
  Start-Service -Name 'ThurayaKnowledge'
  Write-Host 'Started Windows service ThurayaKnowledge'
} else {
  & (Join-Path $here 'start-production.ps1') -ThurayaRoot $ThurayaRoot -LocalProject:$LocalProject
}
$deadline = (Get-Date).AddSeconds(40)
do {
  & (Join-Path $here 'health-check.ps1') -ThurayaRoot $ThurayaRoot
  if ($LASTEXITCODE -eq 0) { exit 0 }
  Start-Sleep -Seconds 2
} while ((Get-Date) -lt $deadline)
exit 1
