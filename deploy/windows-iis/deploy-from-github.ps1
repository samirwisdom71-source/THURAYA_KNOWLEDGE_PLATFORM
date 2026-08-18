param(
  [Parameter(Mandatory = $true)]
  [string]$RepoUrl,
  [string]$Branch = 'main',
  [string]$RepoDir,
  [string]$ThurayaRoot
)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $here '_common.ps1')
$paths = Get-ThurayaPaths $ThurayaRoot

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw 'git is not installed or not in PATH. Install Git for Windows on the server first.'
}

if (-not $RepoDir) { $RepoDir = 'D:\src\thuraya' }
$parent = Split-Path -Parent $RepoDir
if ($parent) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }

if (-not (Test-Path (Join-Path $RepoDir '.git'))) {
  Write-Host "Cloning $RepoUrl into $RepoDir"
  git clone --branch $Branch --single-branch $RepoUrl $RepoDir
  if ($LASTEXITCODE -ne 0) { throw 'git clone failed' }
} else {
  Write-Host "Updating $RepoDir from $Branch"
  git -C $RepoDir remote set-url origin $RepoUrl
  git -C $RepoDir fetch origin $Branch
  if ($LASTEXITCODE -ne 0) { throw 'git fetch failed' }
  git -C $RepoDir checkout $Branch
  git -C $RepoDir pull --ff-only origin $Branch
  if ($LASTEXITCODE -ne 0) { throw 'git pull failed' }
}

Write-Host "Deploying checked-out source from $RepoDir"
& (Join-Path $here 'deploy-update.ps1') -Source $RepoDir -ThurayaRoot $paths.Root
if ($LASTEXITCODE -ne 0) { throw 'deploy-update failed' }
