$processes = Get-Process -Name "node" -ErrorAction SilentlyContinue
foreach ($p in $processes) {
    Stop-Process -Id $p.Id -Force
    Write-Output ("Killed node PID: " + $p.Id)
}
Write-Output "Done"
