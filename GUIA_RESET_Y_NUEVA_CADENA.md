# 🔄 GUÍA: Reset del Sistema y Nueva Cadena de Suministro

## 📋 Tabla de Contenidos
1. [Reset del Sistema](#reset-del-sistema)
2. [Configuración Inicial](#configuración-inicial)
3. [Ejemplo Completo: Cadena de Baterías de Litio](#ejemplo-completo-cadena-de-baterías-de-litio)
4. [Solución de Problemas](#solución-de-problemas)

---

## 🔄 Reset del Sistema

### Opción 1: Script Automático (Recomendado)

**Windows (PowerShell)**:
```powershell
.\RESET_SISTEMA.ps1
```

**Windows (CMD)**:
```batch
RESET_SISTEMA.bat
```

Este script:
- ✅ Detiene Anvil actual
- ✅ Reinicia Anvil (blockchain limpio)
- ✅ Re-despliega el contrato
- ✅ Configura el sistema desde cero

### Opción 2: Manual

```bash
# 1. Detener Anvil
taskkill /F /IM anvil.exe

# 2. Iniciar Anvil
cd sc
anvil

# 3. En otra terminal, desplegar contrato
cd sc
forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

---

## ⚙️ Configuración Inicial

### Cuentas de Anvil

Anvil genera las mismas cuentas cada vez:

| # | Rol | Dirección | Private Key |
|---|-----|-----------|-------------|
| **0** | **Admin** | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| **1** | **Producer** | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| **2** | **Factory** | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |
| **3** | **Retailer** | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6` |
| **4** | **Consumer** | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a` |

### Importar Cuentas en MetaMask

1. **Abrir MetaMask** → Icono de cuenta → "Importar cuenta"
2. **Pegar Private Key** de la cuenta deseada
3. **Repetir** para cada cuenta que vayas a usar
4. **Renombrar** las cuentas para identificarlas:
   - "Admin - Supply Chain"
   - "Producer - Supply Chain"
   - "Factory - Supply Chain"
   - etc.

### Registrar y Aprobar Usuarios

#### Paso 1: Registrar Producer
```
1. MetaMask → Cambiar a cuenta Producer (cuenta #1)
2. Ir a http://localhost:3000
3. Conectar wallet
4. Seleccionar rol: "Producer"
5. Click "Solicitar Rol"
6. Confirmar en MetaMask
```

#### Paso 2: Aprobar Producer (como Admin)
```
1. MetaMask → Cambiar a cuenta Admin (cuenta #0)
2. Ir a http://localhost:3000
3. Dashboard → Ver usuario pendiente
4. Click "Aprobar"
5. Confirmar en MetaMask
```

#### Paso 3: Repetir para otros roles
```
- Factory (cuenta #2)
- Retailer (cuenta #3)
- Consumer (cuenta #4)
```

---

## 🔋 Ejemplo Completo: Cadena de Baterías de Litio

### Flujo de la Cadena

```
Producer → Factory → Retailer → Consumer
  Litio  → Batería  → Venta    → Consumo
```

### Paso a Paso Detallado

#### 🌾 **Etapa 1: Producer - Extraer Litio**

**Cuenta**: Producer (`0x7099...79C8`)

**Acción**: Crear token de materia prima

1. **Ir a**: Dashboard → "Crear Token"

2. **Llenar formulario**:
   ```
   Nombre: Carbonato de Litio
   Cantidad Total: 10000
   Características (JSON):
   {
     "origen": "Salar de Uyuni, Bolivia",
     "pureza": "99.5%",
     "certificacion": "ISO-9001",
     "lote": "LIT-2025-001",
     "fecha_extraccion": "2025-12-05"
   }
   Token Padre: 0 (es original)
   ```

3. **Crear Token** → Confirmar en MetaMask

4. **Resultado**: Token ID #1 creado con 10,000 unidades

**Verificar**:
```
Dashboard → "Mis Tokens" → Ver "Carbonato de Litio"
Balance: 10,000 unidades
```

---

#### 🏭 **Etapa 2: Producer → Factory**

**Transferir Litio a la Fábrica**

**Cuenta**: Producer

1. **Ir a**: Mis Tokens → Token "Carbonato de Litio" → "Transferir"

2. **Llenar formulario**:
   ```
   Destinatario: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (Factory)
   Cantidad: 5000
   ```

3. **Enviar Transferencia** → Confirmar en MetaMask

**Cambiar a Factory**:

**Cuenta**: Factory (`0x3C44...93BC`)

4. **Ir a**: Dashboard → "Transferencias Pendientes"

5. **Ver transferencia**:
   ```
   📥 Transferencia Entrante
   De: Producer (0x7099...79C8)
   Token: Carbonato de Litio
   Cantidad: 5,000 unidades
   ```

6. **Click "Aceptar"** → Confirmar en MetaMask

**Verificar**:
```
Factory → Mis Tokens → "Carbonato de Litio"
Balance: 5,000 unidades
```

---

#### 🏭 **Etapa 3: Factory - Manufacturar Batería**

**Cuenta**: Factory

**Acción**: Crear token de producto manufacturado

1. **Ir a**: Dashboard → "Crear Token"

2. **Llenar formulario**:
   ```
   Nombre: Batería Ion-Litio 3.7V
   Cantidad Total: 1000
   Características (JSON):
   {
     "voltaje": "3.7V",
     "capacidad": "3000mAh",
     "tipo": "18650",
     "material_catodo": "LiCoO2",
     "material_anodo": "Grafito",
     "ciclos_vida": "500-800",
     "certificacion": "UL-1642",
     "fabricante": "TechBattery Factory",
     "fecha_fabricacion": "2025-12-05"
   }
   Token Padre: 1 (deriva del Carbonato de Litio)
   ```

3. **Crear Token** → Confirmar en MetaMask

4. **Resultado**: Token ID #2 creado con 1,000 unidades

**Relación**:
- Token #2 (Batería) deriva de Token #1 (Litio)
- Trazabilidad completa desde la materia prima

---

#### 🏭 **Etapa 4: Factory → Retailer**

**Transferir Baterías al Minorista**

**Cuenta**: Factory

1. **Ir a**: Mis Tokens → "Batería Ion-Litio 3.7V" → "Transferir"

2. **Llenar formulario**:
   ```
   Destinatario: 0x90F79bf6EB2c4f870365E785982E1f101E93b906 (Retailer)
   Cantidad: 500
   ```

3. **Enviar** → Confirmar en MetaMask

**Cuenta**: Retailer (`0x90F7...3b906`)

4. **Ir a**: Transferencias → "Aceptar" transferencia

**Verificar**:
```
Retailer → Mis Tokens → "Batería Ion-Litio 3.7V"
Balance: 500 unidades
```

---

#### 🏪 **Etapa 5: Retailer - Empaquetar para Venta**

**Cuenta**: Retailer

**Acción**: Crear producto para venta final

1. **Ir a**: Dashboard → "Crear Token"

2. **Llenar formulario**:
   ```
   Nombre: Pack Batería Premium
   Cantidad Total: 100
   Características (JSON):
   {
     "contenido": "4x Baterías Ion-Litio 3.7V",
     "empaque": "Blister sellado",
     "incluye": "Cable USB-C, Manual",
     "garantia": "12 meses",
     "precio_sugerido": "$49.99",
     "codigo_barras": "7501234567890",
     "retailer": "TechStore",
     "fecha_empaque": "2025-12-05"
   }
   Token Padre: 2 (deriva de las Baterías)
   ```

3. **Crear Token** → Confirmar

4. **Resultado**: Token ID #3 creado con 100 packs

---

#### 🏪 **Etapa 6: Retailer → Consumer**

**Vender al Consumidor Final**

**Cuenta**: Retailer

1. **Ir a**: Mis Tokens → "Pack Batería Premium" → "Transferir"

2. **Llenar formulario**:
   ```
   Destinatario: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 (Consumer)
   Cantidad: 10
   ```

3. **Enviar** → Confirmar

**Cuenta**: Consumer (`0x15d3...C6A65`)

4. **Ir a**: Transferencias → "Aceptar"

**Verificar**:
```
Consumer → Mis Tokens → "Pack Batería Premium"
Balance: 10 packs
```

---

## 🔍 Verificar Trazabilidad Completa

**Cuenta**: Consumer

1. **Ir a**: Mis Tokens → "Pack Batería Premium" → "Detalles"

2. **Ver información**:
   ```
   📦 Pack Batería Premium (Token #3)
   ├─ Token Padre: #2 (Batería Ion-Litio 3.7V)
   │  └─ Token Padre: #1 (Carbonato de Litio)
   │     └─ Token Padre: #0 (Original)
   │
   ├─ Creador: Retailer (0x90F7...3b906)
   │
   └─ Historial de Transferencias:
      └─ 📥 Recibida de Retailer
          Fecha: 5 dic. 2025, 16:30
          Cantidad: 10 unidades
   ```

**Consumer puede rastrear**:
- ✅ Origen del litio (Bolivia, Salar de Uyuni)
- ✅ Pureza del material (99.5%)
- ✅ Especificaciones de la batería (3.7V, 3000mAh)
- ✅ Garantía y contenido del pack
- ✅ Toda la cadena: Producer → Factory → Retailer → Consumer

---

## 📊 Resumen Final del Estado

### Tokens Creados

| ID | Nombre | Creador | Padre | Supply |
|----|--------|---------|-------|--------|
| #1 | Carbonato de Litio | Producer | 0 (Original) | 10,000 |
| #2 | Batería Ion-Litio 3.7V | Factory | #1 | 1,000 |
| #3 | Pack Batería Premium | Retailer | #2 | 100 |

### Distribución de Tokens

| Usuario | Token #1 (Litio) | Token #2 (Batería) | Token #3 (Pack) |
|---------|------------------|--------------------|--------------------|
| Producer | 5,000 | 0 | 0 |
| Factory | 5,000 | 500 | 0 |
| Retailer | 0 | 500 | 90 |
| Consumer | 0 | 0 | 10 |

### Transferencias Realizadas

1. **Transfer #1**: Producer → Factory (5,000 Litio) ✅ Aceptada
2. **Transfer #2**: Factory → Retailer (500 Baterías) ✅ Aceptada
3. **Transfer #3**: Retailer → Consumer (10 Packs) ✅ Aceptada

---

## ⚠️ Solución de Problemas

### Problema 1: "Tokens no aparecen después de crearlos"

**Solución**:
```
1. Verificar que estás conectado con la cuenta correcta
2. Click en "🔄 Refrescar" en la página de Tokens
3. Verificar que la transacción se confirmó en MetaMask
4. Revisar que no estés conectado como Admin
```

### Problema 2: "No puedo aceptar una transferencia"

**Causas comunes**:
- ❌ Estás conectado con la cuenta incorrecta
- ❌ La transferencia no está destinada a ti

**Solución**:
```
1. Ver la advertencia roja en la transferencia
2. Cambiar a la cuenta correcta en MetaMask
3. Click "🔄 Refrescar"
4. Ahora podrás aceptar
```

### Problema 3: "Error al crear token desde Factory"

**Causa**: Factory creó token con parentId = 0 (debería derivar del Litio)

**Solución**:
```
Al crear token en Factory:
- Token Padre: 1 (el ID del token de Litio recibido)
- NO usar 0 (eso es solo para Producer)
```

### Problema 4: "Anvil se detuvo"

**Solución**:
```bash
# Reiniciar Anvil
cd sc
anvil
```

### Problema 5: "Contrato no responde"

**Solución**:
```bash
# Re-desplegar contrato
cd sc
forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

---

## 🎯 Checklist de Verificación

### Antes de empezar
- [ ] Anvil está corriendo
- [ ] Frontend está corriendo (`npm run dev`)
- [ ] Contrato desplegado correctamente
- [ ] MetaMask configurado con las cuentas

### Configuración inicial
- [ ] Admin NO está registrado como usuario
- [ ] Producer registrado y aprobado
- [ ] Factory registrado y aprobado
- [ ] Retailer registrado y aprobado
- [ ] Consumer registrado y aprobado

### Flujo de tokens
- [ ] Producer creó token de materia prima (parentId = 0)
- [ ] Producer transfirió a Factory
- [ ] Factory aceptó transferencia
- [ ] Factory creó producto manufacturado (parentId = token recibido)
- [ ] Factory transfirió a Retailer
- [ ] Retailer aceptó y creó producto final
- [ ] Retailer vendió a Consumer
- [ ] Consumer puede ver trazabilidad completa

---

## 📝 Notas Adicionales

### Buenas Prácticas

1. **Nombres Descriptivos**: Usa nombres claros para los tokens
2. **Características Completas**: Incluye toda la información relevante en JSON
3. **Parent ID Correcto**: Siempre especifica el token del que deriva
4. **Verificar Balance**: Antes de transferir, verifica que tienes suficientes unidades
5. **Confirmar Destino**: Revisa bien la dirección del destinatario

### Flujo Correcto de la Cadena

```
Producer (parentId=0)
    ↓ Transferir
Factory (parentId=ID_del_litio)
    ↓ Transferir
Retailer (parentId=ID_de_bateria)
    ↓ Transferir
Consumer (no crea más tokens)
```

### Comandos Útiles para Debugging

```bash
# Ver todos los tokens
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "nextTokenId()" --rpc-url http://localhost:8545

# Ver info de un token
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "getToken(uint256)" 1 --rpc-url http://localhost:8545

# Ver balance de un token
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "getTokenBalance(uint256,address)" 1 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --rpc-url http://localhost:8545
```

---

**Fecha**: 5 de Diciembre de 2025
**Versión**: 1.6.0
**Estado**: Sistema Listo para Producción 🚀
