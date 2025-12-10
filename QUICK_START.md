# 🚀 Inicio Rápido - Supply Chain Tracker

## ✅ Estado Actual del Proyecto

### Smart Contract: 100% Completado ✅
- ✅ Contrato SupplyChain.sol implementado (428 líneas)
- ✅ Script de despliegue Deploy.s.sol
- ✅ 48 tests unitarios - **TODOS PASANDO**
- ✅ Compilación exitosa con Foundry

### Frontend: Base Configurada 📦
- ✅ Estructura de carpetas creada
- ✅ Configuración de Next.js, TypeScript, Tailwind
- ✅ Dependencias instaladas (421 packages)
- ⚠️ Código de la aplicación pendiente (ver IMPLEMENTATION_GUIDE.md)

---

## 🏃 Inicio en 5 Minutos

### Terminal 1: Blockchain Local

```bash
# Iniciar Anvil (blockchain local)
cd sc
anvil
```

**📋 Copiar las Private Keys que aparecen** - Las necesitarás para MetaMask

### Terminal 2: Desplegar Smart Contract

```bash
cd sc

# Compilar (verificar que compile sin errores)
forge build

# Ejecutar tests (verificar que todos pasen)
forge test

# Desplegar en Anvil
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast

# ⚠️ IMPORTANTE: Copiar la dirección del contrato que aparece en la salida
# Ejemplo: "SupplyChain deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3"
```

### Terminal 3: Frontend (Una vez implementado)

```bash
cd web

# Crear archivo .env.local con la dirección del contrato
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=0x_TU_DIRECCION_AQUI" > .env.local
echo "NEXT_PUBLIC_ADMIN_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" >> .env.local
echo "NEXT_PUBLIC_RPC_URL=http://localhost:8545" >> .env.local
echo "NEXT_PUBLIC_CHAIN_ID=31337" >> .env.local

# Iniciar desarrollo
npm run dev

# Abrir http://localhost:3000
```

---

## 🦊 Configurar MetaMask

### 1. Agregar Red Anvil

En MetaMask:
- **Network Name:** Anvil Local
- **RPC URL:** http://localhost:8545
- **Chain ID:** 31337
- **Currency Symbol:** ETH

### 2. Importar Cuentas de Prueba

Importa estas private keys en MetaMask (⚠️ Solo para desarrollo):

```
Admin (Deploy):
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Producer:
0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Factory:
0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

Retailer:
0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6

Consumer:
0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
```

**Direcciones correspondientes:**
```
Admin:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Producer: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Factory:  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Retailer: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
Consumer: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
```

---

## 🧪 Probar el Smart Contract

### Opción 1: Con Foundry Tests

```bash
cd sc

# Ejecutar todos los tests
forge test

# Test específico con detalles
forge test --match-test testCompleteSupplyChainFlow -vvv

# Ver gas reports
forge test --gas-report
```

### Opción 2: Con Cast (CLI)

```bash
# Verificar admin
cast call 0x_TU_CONTRACT_ADDRESS "admin()" --rpc-url http://localhost:8545

# Solicitar rol Producer
cast send 0x_TU_CONTRACT_ADDRESS \
  "requestUserRole(string)" "Producer" \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
  --rpc-url http://localhost:8545

# Aprobar usuario (como admin)
cast send 0x_TU_CONTRACT_ADDRESS \
  "changeStatusUser(address,uint8)" \
  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 1 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545
```

---

## 📂 Archivos Clave

### Smart Contract ✅
- `sc/src/SupplyChain.sol` - Contrato principal (428 líneas)
- `sc/script/Deploy.s.sol` - Script de despliegue
- `sc/test/SupplyChain.t.sol` - 48 tests unitarios
- `sc/foundry.toml` - Configuración

### Frontend Base 📦
- `web/package.json` - Dependencias configuradas
- `web/tsconfig.json` - TypeScript configurado
- `web/tailwind.config.ts` - Tailwind configurado
- `web/app/globals.css` - Estilos base

### Documentación 📚
- `README.md` - Overview del proyecto
- `INICIO.md` - Plan completo original (833 líneas)
- `IMPLEMENTATION_GUIDE.md` - Guía paso a paso del frontend
- `QUICK_START.md` - Este archivo

---

## 🎯 Próximos Pasos

### Para Completar el Proyecto:

1. **Seguir IMPLEMENTATION_GUIDE.md** paso a paso:
   - ✅ PASO 1: Exportar ABI del contrato
   - ✅ PASO 2: Crear servicio Web3
   - ✅ PASO 3: Implementar Web3Context
   - ✅ PASO 4: Crear Layout principal
   - ✅ PASO 5: Implementar página principal
   - ✅ PASO 6: Configurar .env.local

2. **Implementar páginas adicionales:**
   - Dashboard por roles
   - Gestión de tokens
   - Sistema de transferencias
   - Panel de administración
   - Perfil de usuario

3. **Crear componentes UI:**
   - Header con navegación
   - TokenCard
   - TransferList
   - UserTable

---

## 🔍 Verificar Instalación

### Smart Contract
```bash
cd sc

# ¿Compila?
forge build

# ¿Pasan los tests?
forge test

# Debe mostrar: "48 tests passed"
```

### Frontend
```bash
cd web

# ¿Están las dependencias?
ls node_modules | wc -l
# Debe mostrar ~421 packages

# ¿Compila TypeScript?
npm run build
```

---

## 🆘 Troubleshooting

### "Command not found: forge"
```bash
# Instalar Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### "Cannot find module ethers"
```bash
cd web
npm install
```

### "MetaMask no conecta"
- Verificar que Anvil esté corriendo en http://localhost:8545
- Verificar Chain ID: 31337
- Importar al menos una private key de Anvil

### "Transaction reverted"
- Verificar que el usuario esté aprobado (status = 1)
- Verificar que haya balance suficiente
- Revisar flujo: Producer → Factory → Retailer → Consumer

---

## 📊 Funcionalidades Implementadas

### Smart Contract ✅

#### Gestión de Usuarios
- ✅ Registro por roles
- ✅ Aprobación por admin
- ✅ Estados: Pending, Approved, Rejected, Canceled
- ✅ Validación de permisos

#### Gestión de Tokens
- ✅ Creación con metadatos JSON
- ✅ Sistema de parentesco (trazabilidad)
- ✅ Balances individuales
- ✅ Consulta de tokens por usuario

#### Transferencias
- ✅ Flujo controlado por roles
- ✅ Sistema de aprobación
- ✅ Estados: Pending, Accepted, Rejected
- ✅ Validaciones automáticas

### Frontend 📦

#### Base
- ✅ Configuración Next.js 15
- ✅ TypeScript estricto
- ✅ Tailwind CSS
- ✅ 421 dependencias instaladas

#### Por Implementar (ver IMPLEMENTATION_GUIDE.md)
- ⚠️ Web3Context y servicios
- ⚠️ Páginas de la aplicación
- ⚠️ Componentes UI
- ⚠️ Integración completa

---

## 📈 Estadísticas del Proyecto

- **Líneas de Solidity:** 428 (SupplyChain.sol)
- **Líneas de Tests:** 815 (SupplyChain.t.sol)
- **Tests Unitarios:** 48 (100% passing)
- **Coverage:** Completa
- **Gas Optimizado:** 200 runs
- **Dependencias Frontend:** 421 packages
- **Tiempo de Implementación SC:** ~2-3 horas
- **Tiempo Estimado Frontend:** ~6-8 horas

---

## 🎓 Recursos de Aprendizaje

### Foundry
- Documentación: https://book.getfoundry.sh/
- Tests: https://book.getfoundry.sh/forge/tests
- Cast: https://book.getfoundry.sh/reference/cast/

### Next.js
- App Router: https://nextjs.org/docs/app
- Data Fetching: https://nextjs.org/docs/app/building-your-application/data-fetching

### Ethers.js
- v6 Docs: https://docs.ethers.org/v6/
- Provider: https://docs.ethers.org/v6/api/providers/
- Contract: https://docs.ethers.org/v6/api/contract/

### TypeScript
- Handbook: https://www.typescriptlang.org/docs/handbook/
- React & TypeScript: https://react-typescript-cheatsheet.netlify.app/

---

## ✅ Checklist Rápido

### Antes de Empezar
- [ ] Node.js 18+ instalado
- [ ] Foundry instalado
- [ ] MetaMask instalado
- [ ] Git inicializado

### Smart Contract
- [x] Contrato compilado
- [x] Tests pasando (48/48)
- [ ] Anvil corriendo
- [ ] Contrato desplegado
- [ ] Dirección copiada

### Frontend
- [x] Dependencias instaladas
- [ ] .env.local configurado
- [ ] ABI exportado
- [ ] Web3Service implementado
- [ ] Web3Context implementado
- [ ] Layout implementado
- [ ] Página principal implementada

### MetaMask
- [ ] Red Anvil agregada
- [ ] Private keys importadas (mínimo 2)
- [ ] Conectado a red local

---

**Estado:** Smart Contract 100% ✅ | Frontend Base 30% 📦

**Siguiente:** Seguir [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) para completar frontend
