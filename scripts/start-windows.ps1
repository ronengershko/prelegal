Set-Location (Split-Path $PSScriptRoot)
docker compose up -d --build
Write-Host "PreLegal is running at http://localhost:8000"
