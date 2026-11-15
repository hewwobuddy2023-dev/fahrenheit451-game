# Fahrenheit 451 - Chapter 1 redesign preview server (Windows, no installs needed).
# Serves the built game from this folder at http://localhost:8451/ and opens it in the default browser.
# Saves made here belong to "localhost:8451" only; they can never touch the classroom site's saved game.
$ErrorActionPreference = 'Stop'
$root = Join-Path $PSScriptRoot 'game'
$port = 8451
$prefix = "http://localhost:$port/"
$types = @{ '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript'; '.css' = 'text/css'; '.webp' = 'image/webp';
  '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.svg' = 'image/svg+xml'; '.woff' = 'font/woff'; '.woff2' = 'font/woff2';
  '.json' = 'application/json'; '.ico' = 'image/x-icon'; '.webmanifest' = 'application/manifest+json' }

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try { $listener.Start() } catch {
  Write-Host "Could not start on port $port. Is the preview already running? Close the other window and try again." -ForegroundColor Red
  Read-Host 'Press Enter to close'; exit 1
}
Write-Host "Fahrenheit 451 Chapter 1 preview running at $prefix" -ForegroundColor Green
Write-Host 'Keep this window open while you play. Close it (or press Ctrl+C) to stop the preview.'
if (-not $env:F451_NO_BROWSER) { Start-Process $prefix } # tests set this to avoid opening a tab

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if ($path -eq '') { $path = 'index.html' }
    $file = [IO.Path]::GetFullPath((Join-Path $root $path))
    # never serve anything outside the game folder
    if (-not $file.StartsWith([IO.Path]::GetFullPath($root)) -or -not (Test-Path $file -PathType Leaf)) {
      $ctx.Response.StatusCode = 404; $ctx.Response.Close(); continue
    }
    $bytes = [IO.File]::ReadAllBytes($file)
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $ctx.Response.ContentType = $(if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' })
    $ctx.Response.Headers.Add('Cache-Control', 'no-store')
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $ctx.Response.Close()
  }
} finally { $listener.Stop() }
