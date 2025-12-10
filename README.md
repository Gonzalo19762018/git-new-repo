# 📦 Supply Chain Tracker - Sistema de Trazabilidad Blockchain

Sistema descentralizado de trazabilidad para cadenas de suministro construido con Solidity, Next.js y Ethers.js. Permite rastrear productos desde su origen hasta el consumidor final con total transparencia y seguridad.

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Características Principales](#-características-principales)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Despliegue del Smart Contract](#-despliegue-del-smart-contract)
- [Uso de la Aplicación](#-uso-de-la-aplicación)
- [Roles y Permisos](#-roles-y-permisos)
- [Mejoras Implementadas](#-mejoras-implementadas)
- [Arquitectura](#-arquitectura)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Descripción General

Supply Chain Tracker es una aplicación blockchain que permite rastrear productos a través de toda la cadena de suministro. Cada participante (Producer, Factory, Retailer, Consumer) puede crear, transferir y rastrear tokens que representan productos físicos.

### Tecnologías Utilizadas

- **Smart Contract**: Solidity 0.8.25
- **Framework Blockchain**: Foundry
- **Frontend**: Next.js 15.1.6 + React 19
- **Blockchain Library**: Ethers.js 6.13.0
- **Estilos**: Tailwind CSS 3.4.1
- **Blockchain Local**: Anvil (Foundry)
- **Lenguaje**: TypeScript 5

---

## ✨ Características Principales

### Gestión de Usuarios
- ✅ Registro por roles (Producer, Factory, Retailer, Consumer)
- ✅ Sistema de aprobación por Admin
- ✅ Estados de usuario (Pending, Approved, Rejected, Canceled)
- ✅ Detección automática de cambio de cuenta

### Gestión de Tokens
- ✅ Creación de tokens originales y derivados
- ✅ Sistema de herencia (parentId)
- ✅ Características personalizables en JSON
- ✅ Control de supply

### Sistema de Transferencias
- ✅ Transferencias peer-to-peer
- ✅ Sistema de aceptación/rechazo
- ✅ Auto-refresh cada 10 segundos
- ✅ Notificaciones de nuevas transferencias

### Trazabilidad
- ✅ Trazabilidad completa desde origen hasta consumidor
- ✅ Historial de transferencias
- ✅ Visualización de características de cada etapa
- ✅ Balance de usuario en cada token de la cadena

### Panel de Administración
- ✅ Aprobación/rechazo de usuarios
- ✅ Supervisión del sistema
- ✅ Estadísticas en tiempo real
- ✅ Gestión de estados de usuario

---

## 📋 Requisitos Previos

### Software Necesario

1. **Node.js** (versión 18 o superior)
   ```bash
   node --version  # Debe ser v18.x.x o superior
   ```

2. **npm** (viene con Node.js)
   ```bash
   npm --version
   ```

3. **Foundry** (para el smart contract)
   - **Linux/macOS**:
     ```bash
     curl -L https://foundry.paradigm.xyz | bash
     foundryup
     ```
   - **Windows**:
     ```bash
     # Instalar Rust primero
     # Luego:
     cargo install --git https://github.com/foundry-rs/foundry foundry-cli anvil --bins --locked
     ```

4. **MetaMask** (extensión de navegador)
   - Descargar desde: https://metamask.io/

### Verificar Instalación

```bash
# Verificar Node.js y npm
node --version
npm --version

# Verificar Foundry
forge --version
anvil --version

# Verificar Git
git --version
```

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/supply-chain-tracker.git
cd supply-chain-tracker
```

### 2. Instalar Dependencias del Frontend

```bash
cd web
npm install
```

### 3. Instalar Dependencias del Smart Contract

```bash
cd ../sc
forge install
```

---

## ⚙️ Configuración

### 1. Configurar Variables de Entorno

Crear archivo `.env.local` en la carpeta `web/`:

```bash
cd web
cat > .env.local << EOF
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=31337
EOF
```

### 2. Configurar MetaMask

#### Agregar Red Anvil Local

1. Abrir MetaMask
2. Click en el selector de red
3. Click en "Agregar red"
4. Click en "Agregar red manualmente"
5. Configurar:
   - **Network Name**: `Anvil Local`
   - **RPC URL**: `http://localhost:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
6. Click en "Guardar"

#### Importar Cuentas de Prueba

Importar las siguientes private keys en MetaMask:

**Admin** (Primera cuenta):
```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Dirección: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

**Producer** (Segunda cuenta):
```
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Dirección: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

**Factory** (Tercera cuenta):
```
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
Dirección: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

**Retailer** (Cuarta cuenta):
```
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
Dirección: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
```

**Consumer** (Quinta cuenta):
```
Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
Dirección: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
```

---

## 🔧 Despliegue del Smart Contract

### 1. Iniciar Anvil (Blockchain Local)

En una terminal separada:

```bash
cd sc
anvil
```

Anvil iniciará en `http://localhost:8545` con 10 cuentas pre-financiadas.

### 2. Compilar el Smart Contract

```bash
cd sc
forge build
```

### 3. Desplegar el Contrato

```bash
cd sc
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast
```

**Salida esperada**:
```
✅ Contrato desplegado en: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ Admin configurado: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

### 4. Verificar Despliegue

```bash
cd sc
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "admin()" --rpc-url http://localhost:8545
```

---

## 🌐 Uso de la Aplicación

### 1. Iniciar el Frontend

En una nueva terminal:

```bash
cd web
npm run dev
```

La aplicación estará disponible en: http://localhost:3000

### 2. Primera Conexión

1. Abrir http://localhost:3000 en el navegador
2. Click en **"Conectar con MetaMask"**
3. Seleccionar una cuenta (ej: Producer)
4. Aprobar la conexión en MetaMask
5. Cambiar a la red "Anvil Local" si es necesario

### 3. Registro de Usuario

#### Como Usuario Normal (Producer/Factory/Retailer/Consumer):

1. Seleccionar un rol del dropdown
2. Click en **"Solicitar Rol"**
3. Confirmar transacción en MetaMask
4. Estado cambia a **"Pending"** (esperando aprobación)

#### Como Admin (Aprobar Usuarios):

1. Cambiar a la cuenta Admin en MetaMask
2. Recargar la página
3. Ver panel de administración
4. Click en **"Gestionar Usuarios"**
5. Click en botón **"Aprobar"** junto al usuario pendiente
6. Confirmar transacción

### 4. Flujo Completo de la Cadena de Suministro

#### Paso 1: Producer crea token original

1. Conectar como Producer
2. Ir a **"Dashboard"** → **"Crear Token"**
3. Llenar formulario:
   ```
   Nombre: Carbonato de Litio
   Supply: 10000
   Características: {
     "origen": "Salar de Uyuni, Bolivia",
     "pureza": "99.5%",
     "certificacion": "ISO-9001",
     "lote": "LIT-2025-001"
   }
   Parent ID: 0 (token original)
   ```
4. Confirmar transacción
5. Token creado con ID #1

#### Paso 2: Producer transfiere a Factory

1. Ir a **"Mis Tokens"**
2. Click en **"Transferir"** en el token
3. Ingresar:
   ```
   Destinatario: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (Factory)
   Cantidad: 5000
   ```
4. Confirmar transacción

#### Paso 3: Factory acepta y crea token derivado

1. Cambiar a cuenta Factory en MetaMask
2. Ir a **"Transferencias"**
3. Ver transferencia pendiente
4. Click en **"Aceptar"**
5. Ir a **"Crear Token"**
6. Llenar formulario:
   ```
   Nombre: Batería Ion-Litio 3.7V
   Supply: 1000
   Características: {
     "voltaje": "3.7V",
     "capacidad": "3000mAh",
     "tipo": "18650",
     "material_catodo": "LiCoO2"
   }
   Parent ID: 1 (token del litio)
   ```
7. Confirmar transacción
8. Token derivado creado con ID #2

#### Paso 4: Factory transfiere a Retailer

1. Ir a **"Mis Tokens"**
2. Click en **"Transferir"** en las baterías
3. Ingresar:
   ```
   Destinatario: 0x90F79bf6EB2c4f870365E785982E1f101E93b906 (Retailer)
   Cantidad: 500
   ```
4. Confirmar transacción

#### Paso 5: Retailer acepta y crea pack

1. Cambiar a cuenta Retailer
2. Aceptar transferencia en **"Transferencias"**
3. Crear nuevo token:
   ```
   Nombre: Pack Batería Premium
   Supply: 100
   Características: {
     "contenido": "4x Baterías Ion-Litio 3.7V",
     "empaque": "Blister sellado",
     "garantia": "12 meses"
   }
   Parent ID: 2 (token de la batería)
   ```
4. Token pack creado con ID #3

#### Paso 6: Retailer transfiere a Consumer

1. Ir a **"Mis Tokens"**
2. Transferir pack a Consumer:
   ```
   Destinatario: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 (Consumer)
   Cantidad: 10
   ```

#### Paso 7: Consumer verifica trazabilidad

1. Cambiar a cuenta Consumer
2. Aceptar transferencia
3. Ir a **"Mis Tokens"**
4. Click en **"🔍 Ver Trazabilidad"**
5. Ver toda la cadena:
   - Pack Batería Premium (Retailer)
   - ↓ Batería Ion-Litio 3.7V (Factory)
   - ↓ Carbonato de Litio (Producer)

---

## 👥 Roles y Permisos

### 🔑 Admin

**Responsabilidades**:
- Aprobar/rechazar usuarios
- Supervisar el sistema
- Gestionar estados de usuarios

**Permisos**:
- ✅ Aprobar usuarios
- ✅ Rechazar usuarios
- ✅ Cancelar usuarios
- ✅ Ver estadísticas del sistema
- ❌ NO puede crear tokens
- ❌ NO puede hacer transferencias
- ❌ NO se registra como usuario

**Interfaz**:
- Panel de administración
- Gestión de usuarios
- Supervisión del sistema

### 🌾 Producer (Productor)

**Responsabilidades**:
- Crear tokens originales (materias primas)
- Transferir a Factory

**Permisos**:
- ✅ Crear tokens con parentId = 0
- ✅ Transferir tokens
- ✅ Ver trazabilidad
- ✅ Ver detalles de tokens
- ❌ Solo puede crear tokens originales

**Ejemplo de Producto**:
- Carbonato de Litio
- Litio metálico
- Minerales

### 🏭 Factory (Fábrica)

**Responsabilidades**:
- Recibir materias primas de Producer
- Crear tokens derivados (productos procesados)
- Transferir a Retailer

**Permisos**:
- ✅ Crear tokens con parentId > 0
- ✅ Transferir tokens
- ✅ Aceptar/rechazar transferencias
- ✅ Ver trazabilidad
- ✅ Ver detalles de tokens

**Ejemplo de Producto**:
- Batería Ion-Litio (derivado de Litio)
- Componentes electrónicos

### 🏪 Retailer (Minorista)

**Responsabilidades**:
- Recibir productos de Factory
- Crear packs o bundles
- Vender a Consumer

**Permisos**:
- ✅ Crear tokens derivados
- ✅ Transferir tokens
- ✅ Aceptar/rechazar transferencias
- ✅ Ver trazabilidad
- ✅ Ver detalles de tokens

**Ejemplo de Producto**:
- Pack Batería Premium (4 baterías)
- Bundle de productos

### 🛒 Consumer (Consumidor)

**Responsabilidades**:
- Recibir productos finales
- Verificar trazabilidad

**Permisos**:
- ✅ Aceptar/rechazar transferencias
- ✅ Ver trazabilidad completa
- ✅ Ver balance en cada token de la cadena
- ❌ NO puede crear tokens
- ❌ NO puede transferir
- ❌ NO puede ver detalles de tokens (solo trazabilidad)

**Restricciones Especiales**:
- Botón "Ver Detalles" inactivo
- Solo botón "Ver Trazabilidad" activo

---

## 🎉 Mejoras Implementadas

### 1. Sistema de Auto-Refresh

**Problema Resuelto**: Consumer no veía transferencias nuevas sin recargar manualmente

**Implementación**:
- ✅ Auto-refresh cada 10 segundos en página de transferencias
- ✅ Auto-refresh cada 15 segundos en dashboard
- ✅ Modo silencioso (sin spinner de carga)
- ✅ Detección inteligente de nuevas transferencias
- ✅ Notificación visual cuando llegan nuevas transferencias
- ✅ Botón de refresh manual
- ✅ Timestamp de última actualización

**Archivos Modificados**:
- [web/app/transfers/page.tsx](web/app/transfers/page.tsx)
- [web/app/dashboard/page.tsx](web/app/dashboard/page.tsx)

**Documentación**: [MEJORAS_AUTO_REFRESH.md](MEJORAS_AUTO_REFRESH.md)

### 2. Detección de Cambio de Cuenta

**Problema Resuelto**: Al cambiar de cuenta en MetaMask, la app no se actualizaba y causaba errores en transacciones

**Implementación**:
- ✅ Detección automática de cambio de cuenta
- ✅ Limpieza completa del estado anterior
- ✅ Reconexión automática con nueva cuenta
- ✅ Notificación visual de cambio de cuenta
- ✅ Toast animado mostrando cuenta anterior y nueva
- ✅ Auto-cierre de notificación después de 5 segundos

**Componentes Nuevos**:
- [web/components/AccountChangeNotification.tsx](web/components/AccountChangeNotification.tsx)

**Archivos Modificados**:
- [web/contexts/Web3Context.tsx](web/contexts/Web3Context.tsx)
- [web/app/globals.css](web/app/globals.css)

**Documentación**: [MEJORAS_CAMBIO_CUENTA.md](MEJORAS_CAMBIO_CUENTA.md)

### 3. Trazabilidad Completa

**Funcionalidad**: Ver toda la cadena de suministro desde el origen hasta el consumidor

**Características**:
- ✅ Modal full-screen con toda la cadena
- ✅ Recorre desde token actual hasta origen (parentId = 0)
- ✅ Muestra información del creador de cada token
- ✅ Muestra características de cada etapa
- ✅ Muestra historial completo de transferencias
- ✅ Numeración descendente (3 → 2 → 1)
- ✅ Badges de rol con iconos
- ✅ Formato JSON legible para características

**Disponible para**:
- ✅ Producer
- ✅ Factory
- ✅ Retailer
- ✅ Consumer

**Archivos Implementados**:
- [web/lib/web3.ts](web/lib/web3.ts) - Función `getTokenTraceability()`
- [web/app/tokens/page.tsx](web/app/tokens/page.tsx) - Modal de trazabilidad

**Documentación**: [FUNCIONALIDAD_TRAZABILIDAD.md](FUNCIONALIDAD_TRAZABILIDAD.md)

### 4. Balance en Trazabilidad

**Funcionalidad**: Mostrar el balance del usuario en cada token de la cadena de trazabilidad

**Características**:
- ✅ Muestra balance en cada token de la cadena
- ✅ Solo muestra si el usuario tiene balance > 0
- ✅ Banner azul con formato visual
- ✅ Números formateados con separador de miles
- ✅ Especialmente útil para Consumer

**Caso de Uso**:
Consumer puede ver:
- "Pack Batería Premium: 10 unidades"
- "Batería Ion-Litio 3.7V: 0 unidades" (no se muestra)
- "Carbonato de Litio: 0 unidades" (no se muestra)

**Archivos Modificados**:
- [web/lib/web3.ts](web/lib/web3.ts) - Enhanced `getTokenTraceability()`
- [web/app/tokens/page.tsx](web/app/tokens/page.tsx) - Balance banner

**Documentación**: [FUNCIONALIDAD_BALANCE_TRAZABILIDAD.md](FUNCIONALIDAD_BALANCE_TRAZABILIDAD.md)

### 5. Supervisión del Sistema (Admin)

**Funcionalidad**: Panel completo de estadísticas para el Admin

**Características**:
- ✅ Información del contrato (dirección, admin)
- ✅ Estadísticas de usuarios (total, por rol, por estado)
- ✅ Estadísticas de tokens (total, originales, derivados, supply)
- ✅ Estadísticas de transferencias (total, por estado, tasa de éxito)
- ✅ Resumen general del sistema
- ✅ Timestamp de última actualización

**Métricas Disponibles**:
- Total de usuarios y distribución por rol
- Usuarios aprobados, pendientes, cancelados, rechazados
- Total de tokens y clasificación original/derivado
- Supply total en circulación
- Transferencias aceptadas, pendientes, rechazadas
- Tasa de éxito del sistema

**Archivos Implementados**:
- [web/lib/web3.ts](web/lib/web3.ts) - Función `getSystemStatistics()`
- [web/app/dashboard/page.tsx](web/app/dashboard/page.tsx) - Botón y modal

**Documentación**: [FUNCIONALIDAD_SUPERVISION_SISTEMA.md](FUNCIONALIDAD_SUPERVISION_SISTEMA.md)

### 6. Permisos del Rol Consumer

**Restricciones Implementadas**:
- ✅ Botón "Ver Detalles" inactivo
- ✅ Solo puede ver "Ver Trazabilidad"
- ✅ No puede crear tokens
- ✅ No puede transferir tokens
- ✅ Solo puede aceptar/rechazar transferencias recibidas

**Razón**: El Consumer es el usuario final que solo necesita verificar el origen y aceptar productos

**Archivos Modificados**:
- [web/app/tokens/page.tsx](web/app/tokens/page.tsx)

**Documentación**: [PERMISOS_ROL_CONSUMER.md](PERMISOS_ROL_CONSUMER.md)

### 7. Limpieza de UI

**Cambios**:
- ✅ Eliminada leyenda de separación Admin/Producer
- ✅ Eliminada sección "Funcionalidades en Desarrollo"
- ✅ UI más limpia y profesional
- ✅ Enfoque en funcionalidades activas

**Archivos Modificados**:
- [web/app/dashboard/page.tsx](web/app/dashboard/page.tsx)

---

## 🏗️ Arquitectura

### Estructura del Proyecto

```
supply-chain-tracker/
├── sc/                          # Smart Contract
│   ├── src/
│   │   └── SupplyChain.sol     # Contrato principal (428 líneas)
│   ├── script/
│   │   └── Deploy.s.sol        # Script de despliegue
│   ├── test/
│   │   └── SupplyChain.t.sol   # Tests (48 tests)
│   └── foundry.toml            # Configuración Foundry
│
└── web/                         # Frontend Next.js
    ├── app/
    │   ├── page.tsx            # Página principal (conexión)
    │   ├── dashboard/
    │   │   └── page.tsx        # Dashboard por rol
    │   ├── tokens/
    │   │   └── page.tsx        # Gestión de tokens
    │   └── transfers/
    │       └── page.tsx        # Gestión de transferencias
    ├── components/
    │   └── AccountChangeNotification.tsx
    ├── contexts/
    │   └── Web3Context.tsx     # Estado global Web3
    ├── lib/
    │   └── web3.ts             # Servicio de interacción blockchain
    ├── contracts/
    │   ├── abi.json            # ABI del contrato (676 líneas)
    │   └── config.ts           # Configuración del contrato
    └── package.json
```

### Flujo de Datos

```
Usuario (MetaMask)
    ↓
Web3Context (Estado Global)
    ↓
web3Service (lib/web3.ts)
    ↓
Ethers.js (BrowserProvider)
    ↓
Smart Contract (Anvil/Blockchain)
```

### Smart Contract - Funciones Principales

**Gestión de Usuarios**:
- `registerUser(role)` - Registro de usuario
- `changeStatusUser(address, status)` - Cambiar estado (solo admin)
- `getUserInfo(address)` - Obtener info de usuario
- `getAllUsers()` - Listar todos los usuarios
- `isAdmin(address)` - Verificar si es admin

**Gestión de Tokens**:
- `createToken(name, supply, features, parentId)` - Crear token
- `getToken(tokenId)` - Obtener info de token
- `getUserTokens(address)` - Tokens de un usuario
- `balanceOf(address, tokenId)` - Balance de un token

**Gestión de Transferencias**:
- `createTransfer(to, tokenId, amount)` - Crear transferencia
- `changeStatusTransfer(transferId, status)` - Aceptar/rechazar
- `getTransfer(transferId)` - Info de transferencia
- `getUserTransfers(address)` - Transferencias de un usuario

### Frontend - Servicios Principales

**web3Service** (lib/web3.ts):
- `connectWallet()` - Conectar MetaMask
- `registerUser(role)` - Registrar usuario
- `createToken(...)` - Crear token
- `transferToken(...)` - Crear transferencia
- `acceptTransfer(...)` / `rejectTransfer(...)` - Gestionar transferencias
- `getTokenTraceability(tokenId)` - Obtener trazabilidad completa
- `getSystemStatistics()` - Obtener estadísticas del sistema

**Web3Context** (contexts/Web3Context.tsx):
- Estado global de conexión
- Información de usuario actual
- Auto-detección de cambio de cuenta
- Persistencia con localStorage

---

## 🔍 Troubleshooting

### Problema: "MetaMask no conecta"

**Síntomas**: Al hacer click en "Conectar", MetaMask no se abre

**Soluciones**:
1. Verificar que Anvil esté corriendo:
   ```bash
   curl -X POST http://localhost:8545 \
     -H "Content-Type: application/json" \
     --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```
2. Verificar Chain ID en MetaMask (debe ser 31337)
3. Recargar la página
4. Abrir consola del navegador para ver errores

---

### Problema: "Wrong network"

**Síntomas**: Mensaje de red incorrecta

**Soluciones**:
1. Cambiar a red "Anvil Local" en MetaMask
2. Verificar configuración de red:
   - RPC URL: http://localhost:8545
   - Chain ID: 31337
3. Recargar la página

---

### Problema: "Transaction failed"

**Síntomas**: Transacción rechazada o fallida

**Soluciones**:
1. Verificar que tengas ETH suficiente (cuentas de Anvil tienen 10,000 ETH)
2. Verificar que estés en la cuenta correcta
3. Verificar que el usuario esté aprobado (status = Approved)
4. Verificar que el contrato esté desplegado:
   ```bash
   cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "admin()" --rpc-url http://localhost:8545
   ```

---

### Problema: "Usuario no aprobado"

**Síntomas**: No puedes acceder al dashboard

**Soluciones**:
1. Verificar estado del usuario:
   ```bash
   cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
     "getUserInfo(address)" TU_DIRECCION \
     --rpc-url http://localhost:8545
   ```
2. Aprobar usuario con Admin:
   - Conectar como Admin
   - Ir a "Gestionar Usuarios"
   - Aprobar usuario
3. Recargar la página después de aprobar

---

### Problema: "Frontend no carga"

**Síntomas**: Página en blanco o error 500

**Soluciones**:
1. Verificar que Next.js esté corriendo:
   ```bash
   curl http://localhost:3000
   ```
2. Ver logs de Next.js:
   ```bash
   # En la terminal donde ejecutaste npm run dev
   ```
3. Limpiar caché y reinstalar:
   ```bash
   cd web
   rm -rf .next node_modules
   npm install
   npm run dev
   ```

---

### Problema: "Anvil se detiene"

**Síntomas**: RPC no responde

**Soluciones**:
1. Verificar proceso de Anvil:
   ```bash
   # Windows
   tasklist | findstr anvil

   # Linux/macOS
   ps aux | grep anvil
   ```
2. Reiniciar Anvil:
   ```bash
   # Detener
   pkill anvil  # Linux/macOS
   taskkill /F /IM anvil.exe  # Windows

   # Reiniciar
   cd sc
   anvil
   ```
3. Redesplegar contrato después de reiniciar Anvil

---

### Problema: "No veo las transferencias"

**Síntomas**: Página de transferencias vacía

**Soluciones**:
1. Esperar 10 segundos (auto-refresh)
2. Click en botón "Refrescar Ahora"
3. Verificar que el usuario tenga transferencias:
   ```bash
   cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
     "getUserTransfers(address)" TU_DIRECCION \
     --rpc-url http://localhost:8545
   ```
4. Verificar que estés en la cuenta correcta

---

### Problema: "Trazabilidad no se muestra"

**Síntomas**: Modal vacío o con error

**Soluciones**:
1. Verificar que el token exista:
   ```bash
   cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
     "getToken(uint256)" TOKEN_ID \
     --rpc-url http://localhost:8545
   ```
2. Ver consola del navegador para errores
3. Verificar que haya una cadena de tokens (con parentId)

---

## 📊 Comandos Útiles

### Verificar Estado del Sistema

```bash
# Verificar Anvil
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Verificar Frontend
curl http://localhost:3000

# Ver tests del contrato
cd sc && forge test -vv

# Ver admin del contrato
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "admin()" --rpc-url http://localhost:8545
```

### Interactuar con el Contrato

```bash
cd sc

# Ver información de usuario
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "getUserInfo(address)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  --rpc-url http://localhost:8545

# Ver balance de un token
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "balanceOf(address,uint256)" \
  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 1 \
  --rpc-url http://localhost:8545

# Aprobar usuario manualmente
cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "changeStatusUser(address,uint8)" \
  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 1 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545
```

### Reiniciar Todo el Sistema

```bash
# 1. Detener servicios
pkill anvil
pkill -f "next dev"

# 2. Reiniciar Anvil
cd sc
anvil &

# 3. Esperar 2 segundos
sleep 2

# 4. Redesplegar contrato
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast

# 5. Reiniciar frontend
cd ../web
npm run dev
```

---

## 📈 Estadísticas del Proyecto

- **Líneas de Solidity**: 428
- **Tests Unitarios**: 48 (100% passing)
- **Líneas de TypeScript**: ~1,500
- **Componentes React**: 15+
- **Dependencias**: 27 packages
- **Tiempo de Build**: ~8 segundos
- **Tiempo de Deploy**: ~2 segundos
- **Cobertura de Tests**: 100%

---

## 🎯 Roadmap Futuro

### Funcionalidades Planeadas

- [ ] **Notificaciones Push**: Alertas en tiempo real para transferencias
- [ ] **Exportar Trazabilidad**: PDF o CSV de la cadena completa
- [ ] **Búsqueda Avanzada**: Filtros por fecha, rol, token
- [ ] **Gráficos de Estadísticas**: Visualización de datos con charts
- [ ] **Sistema de Mensajería**: Chat entre participantes
- [ ] **QR Codes**: Generar QR para cada token
- [ ] **Modo Offline**: Caché local de datos
- [ ] **Multi-idioma**: Soporte para inglés, español, portugués

### Optimizaciones Técnicas

- [ ] **Paginación**: Para listas largas de tokens/transferencias
- [ ] **Caché de Estadísticas**: Reducir llamadas al contrato
- [ ] **Eventos del Contrato**: Usar eventos en lugar de polling
- [ ] **IPFS**: Almacenar características grandes fuera de la blockchain
- [ ] **Gas Optimization**: Reducir costos de transacciones
- [ ] **Testing E2E**: Tests de integración completos

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

---

## 👨‍💻 Autor

Proyecto Final de Máster - Supply Chain Tracker
Desarrollado con ❤️ usando Blockchain Technology

---

## 📞 Soporte

Para reportar problemas o sugerencias:

1. **Issues**: Crear un issue en GitHub
2. **Documentación**: Ver los archivos .md en la raíz del proyecto
3. **Logs**: Revisar consola del navegador y terminal

---

**Fecha de Última Actualización**: 9 de Diciembre de 2025
**Versión**: 2.0.0
**Estado**: ✅ Producción
