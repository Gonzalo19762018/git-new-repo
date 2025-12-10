@echo off
echo ========================================
echo   RESET COMPLETO DEL SISTEMA
echo ========================================
echo.
echo Este script hara:
echo 1. Detener Anvil
echo 2. Reiniciar Anvil (limpia blockchain)
echo 3. Re-desplegar el contrato
echo 4. Configurar usuarios basicos
echo.
echo ADVERTENCIA: Se perderan TODOS los datos:
echo - Tokens creados
echo - Transferencias
echo - Usuarios registrados
echo.
pause
echo.

echo [1/4] Deteniendo Anvil...
taskkill /F /IM anvil.exe 2>nul
timeout /t 2 >nul

echo [2/4] Iniciando Anvil en segundo plano...
cd sc
start /B anvil > anvil.log 2>&1
timeout /t 3 >nul

echo [3/4] Desplegando contrato...
forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

echo [4/4] Sistema reiniciado correctamente!
echo.
echo ========================================
echo   CONFIGURACION POST-RESET
echo ========================================
echo.
echo Cuentas de Anvil disponibles:
echo.
echo [0] ADMIN:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
echo     - Rol: Administrador del sistema
echo     - NO se registra como usuario
echo     - Aprueba/rechaza usuarios
echo.
echo [1] PRODUCER: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
echo     - Rol: Productor de materias primas
echo     - DEBE registrarse y ser aprobado
echo     - Crea tokens originales (Litio, etc)
echo.
echo [2] FACTORY:  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
echo     - Rol: Fabrica/Manufacturador
echo     - DEBE registrarse y ser aprobado
echo     - Transforma materias primas
echo.
echo [3] RETAILER: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
echo     - Rol: Minorista
echo     - DEBE registrarse y ser aprobado
echo     - Vende productos finales
echo.
echo [4] CONSUMER: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
echo     - Rol: Consumidor final
echo     - DEBE registrarse y ser aprobado
echo     - Recibe productos finales
echo.
echo ========================================
echo   PROXIMOS PASOS
echo ========================================
echo.
echo 1. Abrir navegador en http://localhost:3000
echo 2. Conectar con cuenta Producer (cuenta [1])
echo 3. Solicitar rol "Producer"
echo 4. Cambiar a cuenta Admin (cuenta [0])
echo 5. Aprobar al Producer
echo 6. Repetir para Factory, Retailer, Consumer
echo 7. Comenzar a crear tokens!
echo.
echo Sistema listo para usar!
echo.
pause
