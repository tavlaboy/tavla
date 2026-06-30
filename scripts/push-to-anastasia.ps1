# Push main to AnastasiaSamsonadze/tavla (Cloudflare deploy repo).
# Does NOT change your origin remote.
#
# 1. Log into GitHub as AnastasiaSamsonadze
# 2. Create a token: https://github.com/settings/tokens (classic, repo scope)
# 3. In PowerShell:
#      $env:GH_TOKEN = "ghp_xxxxxxxx"
#      .\scripts\push-to-anastasia.ps1

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

if (-not $env:GH_TOKEN) {
  Write-Host "Set GH_TOKEN to AnastasiaSamsonadze's Personal Access Token first." -ForegroundColor Yellow
  Write-Host "Create one at: https://github.com/settings/tokens (classic, repo scope)"
  exit 1
}

$env:GH_HOST = "github.com"
$TokenUser = (gh api user --jq ".login" 2>$null)
if ($TokenUser -ne "AnastasiaSamsonadze") {
  Write-Host "Token is for '$TokenUser', expected 'AnastasiaSamsonadze'." -ForegroundColor Red
  exit 1
}

Push-Location $RepoRoot

$repoExists = $false
try {
  gh repo view AnastasiaSamsonadze/tavla 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) { $repoExists = $true }
} catch {}

if (-not $repoExists) {
  Write-Host "Creating private repo AnastasiaSamsonadze/tavla ..."
  gh repo create AnastasiaSamsonadze/tavla --private --description "Tavla Georgian Restaurant website - Tbilisi"
}

Write-Host "Pushing main -> AnastasiaSamsonadze/tavla ..."
git push https://github.com/AnastasiaSamsonadze/tavla.git main:main

Write-Host ""
Write-Host "Done. Cloudflare should deploy commit:" -ForegroundColor Green
git rev-parse --short HEAD
Pop-Location
