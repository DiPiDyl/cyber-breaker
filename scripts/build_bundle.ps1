# Bundles modular CSS and JS into a standalone, zero-dependency index.html
$ErrorActionPreference = 'Stop'
$utf8 = [System.Text.Encoding]::UTF8
$rootDir = (Get-Item $PSScriptRoot).Parent.FullName

Write-Host "Bundling CYBER-BREAKER from $rootDir..."

$cssPath = "$rootDir\css\styles.css"
if (!(Test-Path $cssPath)) { throw "Missing $cssPath" }
$css = [System.IO.File]::ReadAllText($cssPath, $utf8)

$indexPath = "$rootDir\index.html"
if (!(Test-Path $indexPath)) { throw "Missing $indexPath" }
$indexContent = [System.IO.File]::ReadAllText($indexPath, $utf8)

$bodyStart = $indexContent.IndexOf('<body>')
$bodyEnd = $indexContent.IndexOf('<!-- Consolidated Standalone JavaScript Engine -->')
if ($bodyStart -lt 0 -or $bodyEnd -lt 0) {
    throw 'Could not locate body tags or script separator in index.html'
}
$bodyHtml = $indexContent.Substring($bodyStart, $bodyEnd - $bodyStart).TrimEnd()

$audioJs = [System.IO.File]::ReadAllText("$rootDir\js\audio.js", $utf8)
$constantsJs = [System.IO.File]::ReadAllText("$rootDir\js\constants.js", $utf8)
$roomsJs = [System.IO.File]::ReadAllText("$rootDir\js\rooms.js", $utf8)
$gameJs = [System.IO.File]::ReadAllText("$rootDir\js\game.js", $utf8)

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('<!DOCTYPE html>')
[void]$sb.AppendLine('<html lang="en">')
[void]$sb.AppendLine('<head>')
[void]$sb.AppendLine('  <meta charset="UTF-8">')
[void]$sb.AppendLine('  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">')
[void]$sb.AppendLine('  <title>CYBER-BREAKER: Roguelike Pong & Breakout</title>')
[void]$sb.AppendLine('  <style>')
[void]$sb.AppendLine($css)
[void]$sb.AppendLine('  </style>')
[void]$sb.AppendLine('</head>')
[void]$sb.AppendLine($bodyHtml)
[void]$sb.AppendLine('')
[void]$sb.AppendLine('  <!-- Consolidated Standalone JavaScript Engine -->')
[void]$sb.AppendLine('  <script>')
[void]$sb.AppendLine($audioJs)
[void]$sb.AppendLine('')
[void]$sb.AppendLine($constantsJs)
[void]$sb.AppendLine('')
[void]$sb.AppendLine($roomsJs)
[void]$sb.AppendLine('')
[void]$sb.AppendLine($gameJs)
[void]$sb.AppendLine('  </script>')
[void]$sb.AppendLine('</body>')
[void]$sb.AppendLine('</html>')

[System.IO.File]::WriteAllText($indexPath, $sb.ToString(), $utf8)
$fileSize = (Get-Item $indexPath).Length
Write-Host "SUCCESS: index.html bundled successfully. Size: $fileSize bytes."
