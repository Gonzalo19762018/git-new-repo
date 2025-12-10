# 💰 Cuentas Anvil - ETH Balances

## ✅ Problema Resuelto

Las cuentas de test ahora tienen ETH suficiente para realizar transacciones.

---

## 📊 Balances Actuales

| Rol | Dirección | Balance (ETH) | Estado |
|-----|-----------|---------------|--------|
| **Admin** | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | ~9,960 ETH | ✅ Activo |
| **Producer** | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | 10,010 ETH | ✅ Listo |
| **Factory** | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | 10,010 ETH | ✅ Listo |
| **Retailer** | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | 10,010 ETH | ✅ Listo |
| **Consumer** | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | 10,010 ETH | ✅ Listo |

**Total transferido:** 40 ETH (10 ETH a cada cuenta)

---

## 🔑 Claves Privadas (Solo para desarrollo local)

⚠️ **IMPORTANTE**: Estas claves son públicas de Anvil. **NUNCA** las uses en producción o mainnet.

| Rol | Clave Privada |
|-----|---------------|
| **Admin** | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| **Producer** | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| **Factory** | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |
| **Retailer** | `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6` |
| **Consumer** | `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a` |

---

## 🚀 Ahora Puedes

### 1. Registrar Usuarios
Cualquier cuenta puede solicitar un rol sin problemas de gas:
```
http://localhost:3000
→ Conectar con MetaMask (elige Producer, Factory, Retailer o Consumer)
→ Seleccionar rol
→ Click en "Solicitar Rol"
✅ Transacción exitosa (tienes ETH para gas)
```

### 2. Aprobar Usuarios como Admin
```bash
cd sc

# Aprobar Producer
cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "changeStatusUser(address,uint8)" \
  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 1 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545

# Aprobar Factory
cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "changeStatusUser(address,uint8)" \
  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC 1 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545

# Aprobar Retailer
cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "changeStatusUser(address,uint8)" \
  0x90F79bf6EB2c4f870365E785982E1f101E93b906 1 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545

# Aprobar Consumer
cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "changeStatusUser(address,uint8)" \
  0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 1 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545
```

### 3. Crear Tokens (Una vez aprobado)
Ahora Producer, Factory y Retailer pueden crear tokens sin problemas:
```typescript
// Desde la UI o mediante Cast
cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "createToken(string,uint256,string,uint256)" \
  "Trigo" 1000 '{"origen":"Argentina","tipo":"organico"}' 0 \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
  --rpc-url http://localhost:8545
```

### 4. Transferir Tokens
```typescript
cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "transfer(address,uint256,uint256)" \
  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC 1 100 \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
  --rpc-url http://localhost:8545
```

---

## 🔧 Comandos Útiles

### Verificar Balance de Cualquier Cuenta
```bash
# Formato: wei (número grande)
cast balance DIRECCION --rpc-url http://localhost:8545

# Formato: ether (legible)
cast balance DIRECCION --rpc-url http://localhost:8545 --ether
```

### Transferir Más ETH (Si es necesario)
```bash
# Transferir desde Admin a otra cuenta
cast send DIRECCION_DESTINO --value 10ether \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545
```

### Ver Todas las Cuentas de Anvil
Cuando inicias Anvil, muestra 10 cuentas con sus claves privadas:
```bash
# En la terminal donde corre Anvil verás:
# Available Accounts
# (0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000.000000000000000000 ETH)
# (1) 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000.000000000000000000 ETH)
# ...
```

---

## 📊 Cómo Importar Cuentas en MetaMask

### Método 1: Importar por Clave Privada

1. Abre MetaMask
2. Click en el icono de cuenta (arriba a la derecha)
3. Click en **"Importar cuenta"**
4. Selecciona **"Clave privada"**
5. Pega una de las claves privadas de arriba
6. Click en **"Importar"**
7. Renombra la cuenta (ej: "Anvil - Producer")

### Método 2: Conectar a la Red Local

1. En MetaMask, click en el selector de red (arriba)
2. Click en **"Agregar red"**
3. Click en **"Agregar una red manualmente"**
4. Completa:
   - **Nombre de la red**: Anvil Local
   - **URL de RPC**: http://localhost:8545
   - **ID de cadena**: 31337
   - **Símbolo de moneda**: ETH
5. Click en **"Guardar"**

---

## ⚠️ Notas Importantes

### Sobre las Claves Privadas
- ✅ **Desarrollo local**: Estas claves son seguras de usar
- ❌ **Producción**: NUNCA uses estas claves en mainnet o testnets públicas
- 💡 **Por qué**: Son claves públicas conocidas de Anvil, cualquiera las conoce

### Sobre los Balances
- Cada cuenta comienza con 10,000 ETH en Anvil
- Las transacciones consumen gas (pequeñas cantidades)
- Producer tiene ~10,010 ETH porque recibió 10 ETH extra del admin
- Admin gastó ~40 ETH en transferencias (por eso tiene menos de 10,000)

### Sobre Reiniciar Anvil
Si reinicias Anvil:
- ❌ Todos los balances vuelven a 10,000 ETH
- ❌ El contrato necesita ser redesplegado
- ❌ Los usuarios aprobados se pierden
- ❌ Los tokens creados se pierden

Para persistir datos entre sesiones, inicia Anvil con:
```bash
anvil --state state.json --state-interval 1
```

---

## 🎯 Flujo Completo de Uso

### 1. Primera Vez (Ya hecho)
- ✅ Anvil corriendo en puerto 8545
- ✅ Contrato desplegado en 0x5FbDB2315678afecb367f032d93F642f64180aa3
- ✅ Frontend corriendo en http://localhost:3000
- ✅ ETH transferido a cuentas de test

### 2. Registrar Producer (Ya hecho)
- ✅ Conectado con MetaMask
- ✅ Solicitado rol Producer
- ✅ Aprobado por admin
- ✅ Puede usar el Dashboard

### 3. Próximos Pasos
1. **Registrar otras cuentas** (Factory, Retailer, Consumer)
2. **Aprobar las cuentas** con Cast como admin
3. **Crear tokens** como Producer
4. **Transferir tokens** entre roles
5. **Aceptar/Rechazar transferencias**

---

## 🔍 Verificar Estado Actual

### Ver Información de Usuario
```bash
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "getUserInfo(address)" \
  DIRECCION_USUARIO \
  --rpc-url http://localhost:8545
```

### Ver si es Admin
```bash
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "isAdmin(address)" \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --rpc-url http://localhost:8545
```

### Ver Información de Token
```bash
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "getToken(uint256)" \
  1 \
  --rpc-url http://localhost:8545
```

### Ver Balance de Token
```bash
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "balanceOf(uint256,address)" \
  1 \
  DIRECCION_USUARIO \
  --rpc-url http://localhost:8545
```

---

## ✅ Resumen

**Problema Original:**
- Las cuentas Producer, Factory, Retailer y Consumer no tenían ETH
- No podían realizar transacciones (falta de gas)

**Solución Aplicada:**
- Transferidos 10 ETH a cada cuenta desde Admin
- Todas las cuentas ahora tienen >10,000 ETH
- Pueden realizar transacciones sin problemas

**Estado Actual:**
- ✅ **Admin**: ~9,960 ETH (gastó en transferencias)
- ✅ **Producer**: 10,010 ETH (listo para usar)
- ✅ **Factory**: 10,010 ETH (listo para usar)
- ✅ **Retailer**: 10,010 ETH (listo para usar)
- ✅ **Consumer**: 10,010 ETH (listo para usar)

**Ahora puedes:**
- ✅ Registrar usuarios sin errores de gas
- ✅ Aprobar usuarios
- ✅ Crear tokens
- ✅ Transferir tokens
- ✅ Usar todas las funcionalidades del smart contract

---

**¡Problema resuelto! Todas las cuentas tienen ETH suficiente.** 🎉
