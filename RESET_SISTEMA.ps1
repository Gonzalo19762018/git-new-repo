# Script de Reset Completo del Sistema - PowerShell
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RESET COMPLETO DEL SISTEMA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Este script hará:" -ForegroundColor Yellow
Write-Host "1. Detener Anvil"
Write-Host "2. Reiniciar Anvil (limpia blockchain)"
Write-Host "3. Re-desplegar el contrato"
Write-Host "4. Configurar usuarios básicos"
Write-Host ""
Write-Host "ADVERTENCIA: Se perderán TODOS los datos:" -ForegroundColor Red
Write-Host "- Tokens creados"
Write-Host "- Transferencias"
Write-Host "- Usuarios registrados"
Write-Host ""
$confirm = Read-Host "¿Deseas continuar? (S/N)"
if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "Operación cancelada." -ForegroundColor Yellow
    exit
}
Write-Host ""

Write-Host "[1/4] Deteniendo Anvil..." -ForegroundColor Green
Get-Process anvil -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "[2/4] Iniciando Anvil en segundo plano..." -ForegroundColor Green
Set-Location sc
Start-Process anvil -WindowStyle Hidden -RedirectStandardOutput anvil.log -RedirectStandardError anvil_error.log
Start-Sleep -Seconds 3

Write-Host "[3/4] Desplegando contrato..." -ForegroundColor Green
& forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Write-Host "[4/4] Sistema reiniciado correctamente!" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CONFIGURACIÓN POST-RESET" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cuentas de Anvil disponibles:" -ForegroundColor Yellow
Write-Host ""
Write-Host "[0] ADMIN:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" -ForegroundColor White
Write-Host "     - Rol: Administrador del sistema" -ForegroundColor Gray
Write-Host "     - NO se registra como usuario" -ForegroundColor Gray
Write-Host "     - Aprueba/rechaza usuarios" -ForegroundColor Gray
Write-Host ""
Write-Host "[1] PRODUCER: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8" -ForegroundColor Green
Write-Host "     - Rol: Productor de materias primas" -ForegroundColor Gray
Write-Host "     - DEBE registrarse y ser aprobado" -ForegroundColor Gray
Write-Host "     - Crea tokens originales (Litio, etc)" -ForegroundColor Gray
Write-Host ""
Write-Host "[2] FACTORY:  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" -ForegroundColor Blue
Write-Host "     - Rol: Fábrica/Manufacturador" -ForegroundColor Gray
Write-Host "     - DEBE registrarse y ser aprobado" -ForegroundColor Gray
Write-Host "     - Transforma materias primas" -ForegroundColor Gray
Write-Host ""
Write-Host "[3] RETAILER: 0x90F79bf6EB2c4f870365E785982E1f101E93b906" -ForegroundColor Magenta
Write-Host "     - Rol: Minorista" -ForegroundColor Gray
Write-Host "     - DEBE registrarse y ser aprobado" -ForegroundColor Gray
Write-Host "     - Vende productos finales" -ForegroundColor Gray
Write-Host ""
Write-Host "[4] CONSUMER: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65" -ForegroundColor Cyan
Write-Host "     - Rol: Consumidor final" -ForegroundColor Gray
Write-Host "     - DEBE registrarse y ser aprobado" -ForegroundColor Gray
Write-Host "     - Recibe productos finales" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PRÓXIMOS PASOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Abrir navegador en http://localhost:3000" -ForegroundColor White
Write-Host "2. Conectar con cuenta Producer (cuenta [1])" -ForegroundColor White
Write-Host "3. Solicitar rol 'Producer'" -ForegroundColor White
Write-Host "4. Cambiar a cuenta Admin (cuenta [0])" -ForegroundColor White
Write-Host "5. Aprobar al Producer" -ForegroundColor White
Write-Host "6. Repetir para Factory, Retailer, Consumer" -ForegroundColor White
Write-Host "7. Comenzar a crear tokens!" -ForegroundColor White
Write-Host ""
Write-Host "Sistema listo para usar!" -ForegroundColor Green
Write-Host ""
Read-Host "Presiona Enter para salir"
