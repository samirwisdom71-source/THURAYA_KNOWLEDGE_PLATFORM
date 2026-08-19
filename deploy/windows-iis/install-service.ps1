param(
  [string]$ThurayaRoot,
  [string]$ServiceAccount = 'NT AUTHORITY\Local Service'
)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $here '_common.ps1')
$paths = Get-ThurayaPaths $ThurayaRoot
Initialize-ThurayaDirectories $paths

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw 'install-service.ps1 must run in an elevated PowerShell session.'
}

$winswDir = Join-Path $paths.App 'winsw'
New-Item -ItemType Directory -Force -Path $winswDir | Out-Null
$winswExe = Join-Path $winswDir 'ThurayaKnowledge.exe'
$winswXml = Join-Path $winswDir 'ThurayaKnowledge.xml'
$scriptsDir = Join-Path $paths.App 'scripts'
New-Item -ItemType Directory -Force -Path $scriptsDir | Out-Null
Copy-Item -Path (Join-Path $here '*.ps1') -Destination $scriptsDir -Force
Copy-Item -Path (Join-Path $here '.env.production.example') -Destination $scriptsDir -Force
$startScript = Join-Path $scriptsDir 'start-production.ps1'
if (-not (Test-Path $winswExe)) {
  $url = 'https://github.com/winsw/winsw/releases/download/v2.12.0/WinSW-x64.exe'
  Write-Host "Downloading WinSW from $url"
  Invoke-WebRequest -Uri $url -OutFile $winswExe -UseBasicParsing
}

$xml = @"
<service>
  <id>$($paths.ServiceId)</id>
  <name>Thuraya Knowledge Platform</name>
  <description>Next.js production process bound to 127.0.0.1:3000. IIS is the public reverse proxy.</description>
  <executable>powershell.exe</executable>
  <arguments>-NoProfile -ExecutionPolicy Bypass -File `"$startScript`" -ThurayaRoot `"$($paths.Root)`" -Foreground</arguments>
  <workingdirectory>$($paths.Current)</workingdirectory>
  <stoptimeout>20 sec</stoptimeout>
  <onfailure action="restart" delay="5 sec"/>
  <onfailure action="restart" delay="15 sec"/>
  <resetfailure>1 hour</resetfailure>
  <logpath>$($paths.Logs)</logpath>
  <log mode="roll-by-size">
    <sizeThreshold>10240</sizeThreshold>
    <keepFiles>8</keepFiles>
  </log>
</service>
"@
Set-Content -LiteralPath $winswXml -Value $xml -Encoding UTF8

icacls $scriptsDir /grant "${ServiceAccount}:(OI)(CI)RX" | Out-Null
icacls $paths.Releases /grant "${ServiceAccount}:(OI)(CI)RX" | Out-Null
icacls $paths.Storage /grant "${ServiceAccount}:(OI)(CI)M" | Out-Null
icacls $paths.Logs /grant "${ServiceAccount}:(OI)(CI)M" | Out-Null
icacls $paths.EnvFile /grant "${ServiceAccount}:R" | Out-Null

$existing = Get-ServiceState $paths.ServiceId
if ($existing) {
  & $winswExe stopwait
  Start-Sleep -Seconds 1
  & $winswExe uninstall
  Start-Sleep -Seconds 2
}
& $winswExe install

$svc = Get-WmiObject Win32_Service -Filter "Name='$($paths.ServiceId)'"
if ($svc) {
  $svc.Change($null,$null,$null,$null,$null,$null,$ServiceAccount,$null) | Out-Null
}

Set-Service -Name $paths.ServiceId -StartupType Automatic
Start-Service -Name $paths.ServiceId
Write-Host "Installed and started $($paths.ServiceId) as $ServiceAccount"
Write-Host "The process listens on 127.0.0.1:3000 only. Do not open TCP 3000 on the firewall."
