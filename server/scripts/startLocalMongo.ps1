$mongoCommand = Get-Command mongod.exe -ErrorAction SilentlyContinue

if (-not $mongoCommand) {
  $fallback = "C:\mongodb\mongodb-win32-x86_64-windows-8.0.4\bin\mongod.exe"

  if (Test-Path $fallback) {
    $mongoCommand = Get-Item $fallback
  }
}

if (-not $mongoCommand) {
  throw "mongod.exe was not found. Install MongoDB locally or update this script with the correct binary path."
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverDir = Split-Path -Parent $scriptDir
$dataDir = Join-Path $serverDir ".mongodb-data"

if (-not (Test-Path $dataDir)) {
  New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
}

& $mongoCommand.Source --dbpath $dataDir --bind_ip 127.0.0.1 --port 27017
