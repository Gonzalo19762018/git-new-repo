# 🚀 Aplicación Supply Chain Tracker - EN EJECUCIÓN

## ✅ Estado Actual

### 🟢 Smart Contract DESPLEGADO
- **Dirección:** `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Admin:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Red:** Anvil Local (Chain ID: 31337)
- **RPC:** http://localhost:8545

### 🟢 Blockchain Local (Anvil)
- **Estado:** ✅ Corriendo
- **Puerto:** 8545
- **Logs:** `anvil.log`

### 🟢 Frontend Next.js
- **Estado:** ✅ Corriendo
- **URL:** http://localhost:3000
- **Logs:** `web-dev.log`

---

## 🌐 Acceder a la Aplicación

### Abrir en el Navegador
```
http://localhost:3000
```

### Primera Vez - Configurar MetaMask

1. **Agregar Red Anvil Local**
   - Network Name: `Anvil Local`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. **Importar Cuentas de Prueba**

   Importa estas private keys en MetaMask:

   ```
   Admin (primera cuenta):
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   Dirección: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

   Producer:
   0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   Dirección: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8

   Factory:
   0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
   Dirección: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC

   Retailer:
   0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
   Dirección: 0x90F79bf6EB2c4f870365E785982E1f101E93b906

   Consumer:
   0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
   Dirección: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
   ```

---

## 🎮 Cómo Usar la Aplicación

### 1. Primera Conexión
1. Abre http://localhost:3000
2. Click en "Conectar con MetaMask"
3. Selecciona una cuenta (recomendado: Producer para empezar)
4. Aprueba la conexión en MetaMask

### 2. Registro de Usuario
1. Selecciona un rol (Producer, Factory, Retailer o Consumer)
2. Click en "Solicitar Rol"
3. Confirma la transacción en MetaMask
4. **Estado:** Pending (esperando aprobación del admin)

### 3. Aprobar Usuario (como Admin)
1. Cambia a la cuenta Admin en MetaMask (primera cuenta)
2. Recarga la página
3. El admin verá una pantalla diferente con opciones de administración
   - Nota: Panel de admin completo pendiente de implementación
   - Por ahora, aprobar usuarios manualmente con Cast o código

### 4. Aprobar Usuario con Cast (Temporal)
```bash
cd sc

# Ver usuario pendiente (ID 1)
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "users(uint256)" 1 --rpc-url http://localhost:8545

# Aprobar usuario (status 1 = Approved)
cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "changeStatusUser(address,uint8)" \
  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 1 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545
```

### 5. Usar la Aplicación
Una vez aprobado:
1. Recarga la página
2. Verás "¡Bienvenido!" con tu rol
3. Click en "Ir al Dashboard"
   - Nota: Dashboard pendiente de implementación

---

## 📊 Archivos Implementados

### Smart Contract ✅
- [x] `sc/src/SupplyChain.sol` - 428 líneas
- [x] `sc/script/Deploy.s.sol` - Script de despliegue
- [x] `sc/test/SupplyChain.t.sol` - 48 tests (todos pasando)
- [x] Contrato desplegado en Anvil

### Frontend ✅
- [x] `web/contracts/config.ts` - Configuración del contrato
- [x] `web/contracts/abi.json` - ABI extraído (676 líneas)
- [x] `web/lib/web3.ts` - Servicio Web3 con ethers.js
- [x] `web/contexts/Web3Context.tsx` - Contexto global con localStorage
- [x] `web/app/layout.tsx` - Layout con Web3Provider
- [x] `web/app/page.tsx` - Página principal funcional
- [x] `web/app/globals.css` - Estilos Tailwind
- [x] `web/.env.local` - Variables de entorno

---

## 🔍 Ver Logs

### Anvil (Blockchain)
```bash
tail -f anvil.log
```

### Frontend (Next.js)
```bash
tail -f web-dev.log
```

### Smart Contract Deploy
```bash
cat sc/deploy.log
```

---

## 🛠️ Comandos Útiles

### Verificar Estado de Servicios

```bash
# Verificar Anvil
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Verificar Frontend
curl http://localhost:3000 | head -20

# Ver tests del contrato
cd sc && forge test
```

### Interactuar con el Contrato

```bash
cd sc

# Ver admin
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "admin()" --rpc-url http://localhost:8545

# Ver información de usuario
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "getUserInfo(address)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  --rpc-url http://localhost:8545

# Ver si es admin
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "isAdmin(address)" 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --rpc-url http://localhost:8545
```

---

## 🔄 Reiniciar Todo

Si necesitas reiniciar desde cero:

```bash
# 1. Detener servicios
pkill -f anvil
pkill -f "next dev"

# 2. Limpiar
rm -f anvil.log web-dev.log

# 3. Reiniciar Anvil
cd sc
anvil > ../anvil.log 2>&1 &

# 4. Redesplegar contrato
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast

# 5. Reiniciar frontend
cd ../web
npm run dev > ../web-dev.log 2>&1 &
```

---

## 📝 Funcionalidades Actuales

### ✅ Implementado
- [x] Conexión con MetaMask
- [x] Registro de usuarios por rol
- [x] Detección de estado (Pending, Approved, Rejected)
- [x] Persistencia de sesión con localStorage
- [x] Validación de red correcta (Anvil)
- [x] UI responsive y moderna
- [x] Manejo de errores

### 🔨 Pendiente (Ver IMPLEMENTATION_GUIDE.md)
- [ ] Panel de administración para aprobar usuarios
- [ ] Dashboard por roles
- [ ] Gestión de tokens (crear, listar, detalles)
- [ ] Sistema de transferencias
- [ ] Historial y trazabilidad
- [ ] Perfil de usuario

---

## 🎯 Próximos Pasos para Desarrollo

1. **Implementar Panel de Admin**
   - Lista de usuarios pendientes
   - Botones Aprobar/Rechazar
   - Ver todos los usuarios

2. **Implementar Dashboard**
   - Estadísticas por rol
   - Tokens propios
   - Transferencias pendientes

3. **Implementar Gestión de Tokens**
   - Crear token
   - Lista de tokens
   - Detalles de token
   - Transferir token

Ver [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) para código de referencia.

---

## 🆘 Troubleshooting

### "MetaMask no conecta"
- Verifica que Anvil esté corriendo: `curl http://localhost:8545`
- Verifica Chain ID en MetaMask: 31337
- Recarga la página

### "Transaction failed"
- Verifica que tengas ETH suficiente
- Verifica que estés en la cuenta correcta
- Verifica que el contrato esté desplegado

### "Usuario no aprobado"
- Aprueba el usuario con el admin (ver sección 4 arriba)
- Recarga la página después de aprobar

### "Página no carga"
- Verifica frontend: `curl http://localhost:3000`
- Ver logs: `tail -f web-dev.log`
- Reinicia: `pkill -f "next dev" && cd web && npm run dev`

---

## 📊 Estadísticas

- **Líneas de Solidity:** 428
- **Tests Unitarios:** 48 (100% passing)
- **Líneas de TypeScript:** ~500
- **Dependencias:** 421 packages
- **Tiempo de Build:** ~8 segundos
- **Tiempo de Deploy:** ~2 segundos

---

## 🎉 ¡Aplicación Lista!

✅ Smart Contract desplegado y funcionando
✅ Frontend corriendo en http://localhost:3000
✅ Conexión con MetaMask funcionando
✅ Registro de usuarios implementado
✅ Sistema de roles y permisos activo

**Abre tu navegador en:** http://localhost:3000

---

**Fecha:** 2025-12-03
**Versión:** 1.0 - MVP Funcional
**Estado:** 🟢 Todo operativo
