$ports = @(8000,5173)
$killed = @()
foreach ($port in $ports) {
  $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
  if ($conns) {
    $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pp in $pids) {
      try {
        Stop-Process -Id $pp -Force -ErrorAction Stop
        $killed += $pp
        Write-Output ("Stopped PID {0} (port {1})" -f $pp, $port)
      } catch {
        Write-Output ("Failed to stop PID {0}: {1}" -f $pp, $_.Exception.Message)
      }
    }
  } else {
    Write-Output ("No process on port {0}" -f $port)
  }
}
if ($killed.Count -eq 0) {
  Write-Output "No processes killed"
} else {
  Write-Output ("Killed: {0}" -f ($killed -join ','))
}
Remove-Item -Path 'C:\Users\LeoVMC\Desktop\SISMEPA\reporte_academico.xlsx' -ErrorAction SilentlyContinue
Remove-Item -Path 'C:\Users\LeoVMC\Desktop\SISMEPA\students.json' -ErrorAction SilentlyContinue
Write-Output 'Temporary files removed (if existed)'
if ($killed.Count -gt 0) {
  Get-Process -Id $killed -ErrorAction SilentlyContinue | Select-Object Id,ProcessName | ForEach-Object { Write-Output ("Remaining process: {0} {1}" -f $_.Id,$_.ProcessName) }
}
