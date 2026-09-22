# 1-Click Update Script: Rebundles, commits, and pushes updates to GitHub
param(
    [string]$Message
)

$ErrorActionPreference = 'Stop'
$rootDir = (Get-Item $PSScriptRoot).Parent.FullName

Write-Host "=== CYBER-BREAKER: Syncing Updates to GitHub ===" -ForegroundColor Cyan

# 1. Rebundle index.html
Write-Host "`n[1/4] Rebuilding standalone index.html..." -ForegroundColor Yellow
& "$rootDir\scripts\build_bundle.ps1"

# 2. Stage changes
Write-Host "`n[2/4] Staging changes..." -ForegroundColor Yellow
git -C $rootDir add -A

$status = git -C $rootDir status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "No changes detected. Working tree is clean." -ForegroundColor Green
    exit 0
}

Write-Host "Changes detected:"
git -C $rootDir status -s

# 3. Commit
if ([string]::IsNullOrWhiteSpace($Message)) {
    $dateStr = Get-Date -Format "yyyy-MM-dd HH:mm"
    $Message = Read-Host "Enter commit message (Press Enter for 'Update game: $dateStr')"
    if ([string]::IsNullOrWhiteSpace($Message)) {
        $Message = "Update game: $dateStr"
    }
}

Write-Host "`n[3/4] Committing: '$Message'..." -ForegroundColor Yellow
git -C $rootDir commit -m "$Message"

# 4. Push
Write-Host "`n[4/4] Pushing to GitHub (main)..." -ForegroundColor Yellow
git -C $rootDir push origin main

Write-Host "`nSUCCESS! Changes pushed to GitHub." -ForegroundColor Green
Write-Host "Live game will update at: https://dipidyl.github.io/cyber-breaker/" -ForegroundColor Cyan
