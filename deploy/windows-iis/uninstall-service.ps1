param(
  [string]$ThurayaRoot
)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $here '_common.ps1')
$paths = Get-ThurayaPaths $ThurayaRoot
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw 'uninstall-service.ps1 must run in an elevated PowerShell session.'
}
$winswExe = Join-Path $paths.App 'winsw\ThurayaKnowledge.exe'
$svc = Get-ServiceState $paths.ServiceId
if ($svc) {
  if ($svc.Status -eq 'Running') { Stop-Service -Name $paths.ServiceId -Force }
  if (Test-Path $winswExe) { & $winswExe uninstall } else { sc.exe delete $paths.ServiceId | Out-Null }
  Write-Host "Uninstalled $($paths.ServiceId)"
} else {
  Write-Host 'Service was not installed.'
}
