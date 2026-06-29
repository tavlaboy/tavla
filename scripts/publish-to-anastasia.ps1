# Publish Tavla site to AnastasiaSamsonadze/tavla (private, no tavlaboy involvement)
# Usage: create a GitHub PAT at https://github.com/settings/tokens (repo scope), then:
#   $env:GH_TOKEN = "ghp_your_token_here"
#   .\scripts\publish-to-anastasia.ps1

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
  gh repo create AnastasiaSamsonadze/tavla --private --description "Tavla Georgian Restaurant website - Tbilisi"
}

git remote remove origin 2>$null
git remote remove anastasia-origin 2>$null
git remote add origin https://github.com/AnastasiaSamsonadze/tavla.git
git push -u origin main --force

Write-Host ""
Write-Host "Done: https://github.com/AnastasiaSamsonadze/tavla (private)" -ForegroundColor Green
Pop-Location
