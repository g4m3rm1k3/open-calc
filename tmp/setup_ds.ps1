$src = 'incomplete ideas/files (4)'
$dest = 'src/content/data-science'
if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Force $dest }
$files = Get-ChildItem "$src/*.js"
foreach ($f in $files) {
    (Get-Content $f.FullName) -replace 'mentalModels:', 'mentalModel:' | Set-Content "$dest/$($f.Name)"
}
