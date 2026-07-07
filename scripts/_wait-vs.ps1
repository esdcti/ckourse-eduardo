Write-Host 'Aguardando instalacao do Visual Studio Build Tools...'
$i = 0
while (Get-Process | Where-Object { $_.Name -like 'setup' }) {
    Start-Sleep -Seconds 15
    $i++
    Write-Host "  ainda instalando... ($($i * 15)s)"
}
Write-Host 'Setup concluido! Verificando MSVC...'

$msvcDir = 'C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC'
if (Test-Path $msvcDir) {
    $ver = Get-ChildItem $msvcDir | Sort-Object Name -Descending | Select-Object -First 1
    Write-Host "MSVC instalado: $($ver.FullName)"
    $linkExe = Join-Path $ver.FullName 'bin\Hostx64\x64\link.exe'
    Write-Host "link.exe existe: $(Test-Path $linkExe)"
} else {
    Write-Host "MSVC nao encontrado em $msvcDir"
}
