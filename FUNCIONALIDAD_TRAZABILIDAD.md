# 🔍 Funcionalidad de Trazabilidad Completa

## ✅ Implementación Completada

He agregado un botón de **"Ver Trazabilidad"** en la página de tokens que permite a TODOS los usuarios (especialmente Consumer) ver la cadena completa de suministro de un token.

---

## 🎯 ¿Qué se agregó?

### 1. Nueva función en `web3.ts`

**Función**: `getTokenTraceability(tokenId: number)`

Esta función:
- ✅ Recorre toda la cadena de tokens desde el token actual hasta el origen (parentId = 0)
- ✅ Obtiene información del creador de cada token (rol, dirección)
- ✅ Obtiene todas las transferencias aceptadas de cada token
- ✅ Retorna un array completo con toda la información de trazabilidad

### 2. Botón "Ver Trazabilidad" en cada token

**Ubicación**: [web/app/tokens/page.tsx](web/app/tokens/page.tsx)

Cada tarjeta de token ahora tiene un botón verde:
```
🔍 Ver Trazabilidad
```

Este botón está disponible para TODOS los roles:
- ✅ Producer
- ✅ Factory
- ✅ Retailer
- ✅ Consumer

### 3. Modal de Trazabilidad Completa

Cuando haces click en "Ver Trazabilidad", se abre un modal que muestra:

#### Para cada token en la cadena:
1. **Información del Token**:
   - Nombre del token
   - ID del token
   - Rol del creador (Producer, Factory, Retailer)
   - Dirección del creador
   - Supply total
   - Fecha de creación
   - Token padre (parentId)

2. **Características del Producto**:
   - Todas las características en formato JSON
   - Datos técnicos (voltaje, capacidad, pureza, etc.)
   - Certificaciones
   - Origen

3. **Historial de Transferencias**:
   - Todas las transferencias aceptadas
   - Dirección origen (De)
   - Dirección destino (Para)
   - Cantidad transferida
   - Fecha de la transferencia

---

## 📊 Ejemplo Visual

### Flujo de la Cadena de Baterías de Litio

Cuando un **Consumer** hace click en "Ver Trazabilidad" en su token "Pack Batería Premium", verá:

```
┌─────────────────────────────────────────────────┐
│  🔍 Trazabilidad Completa                       │
│  Pack Batería Premium                           │
└─────────────────────────────────────────────────┘

┌─── 3 ─────────────────────────────────────────┐
│ 📦 Pack Batería Premium (Token #3)            │
│ 🏪 Retailer                                    │
│                                                │
│ Creador: 0x90F7...3b906                       │
│ Supply Total: 100 unidades                    │
│ Creado: 9 dic. 2025, 14:30                   │
│ Token Padre: #2                               │
│                                                │
│ Características del Producto:                 │
│ {                                              │
│   "contenido": "4x Baterías Ion-Litio 3.7V",  │
│   "empaque": "Blister sellado",               │
│   "garantia": "12 meses",                     │
│   "precio_sugerido": "$49.99"                 │
│ }                                              │
│                                                │
│ Historial de Transferencias:                  │
│ ┌─ Transferencia #3 ─────────────────────┐   │
│ │ De: 0x90F7...3b906 (Retailer)           │   │
│ │ Para: 0x15d3...C6A65 (Consumer)         │   │
│ │ Cantidad: 10 unidades                   │   │
│ │ Fecha: 9 dic. 2025, 15:00              │   │
│ └──────────────────────────────────────────┘   │
└────────────────────────────────────────────────┘
            ↓
┌─── 2 ─────────────────────────────────────────┐
│ 📦 Batería Ion-Litio 3.7V (Token #2)         │
│ 🏭 Factory                                    │
│                                                │
│ Creador: 0x3C44...93BC                        │
│ Supply Total: 1,000 unidades                  │
│ Creado: 9 dic. 2025, 13:00                   │
│ Token Padre: #1                               │
│                                                │
│ Características del Producto:                 │
│ {                                              │
│   "voltaje": "3.7V",                          │
│   "capacidad": "3000mAh",                     │
│   "tipo": "18650",                            │
│   "material_catodo": "LiCoO2",                │
│   "ciclos_vida": "500-800"                    │
│ }                                              │
│                                                │
│ Historial de Transferencias:                  │
│ ┌─ Transferencia #2 ─────────────────────┐   │
│ │ De: 0x3C44...93BC (Factory)             │   │
│ │ Para: 0x90F7...3b906 (Retailer)         │   │
│ │ Cantidad: 500 unidades                  │   │
│ │ Fecha: 9 dic. 2025, 13:30              │   │
│ └──────────────────────────────────────────┘   │
└────────────────────────────────────────────────┘
            ↓
┌─── 1 ─────────────────────────────────────────┐
│ 📦 Carbonato de Litio (Token #1)             │
│ 🌾 Producer                                   │
│                                                │
│ Creador: 0x7099...79C8                        │
│ Supply Total: 10,000 unidades                 │
│ Creado: 9 dic. 2025, 12:00                   │
│ Token Padre: Original                         │
│                                                │
│ Características del Producto:                 │
│ {                                              │
│   "origen": "Salar de Uyuni, Bolivia",        │
│   "pureza": "99.5%",                          │
│   "certificacion": "ISO-9001",                │
│   "lote": "LIT-2025-001",                     │
│   "fecha_extraccion": "2025-12-05"            │
│ }                                              │
│                                                │
│ Historial de Transferencias:                  │
│ ┌─ Transferencia #1 ─────────────────────┐   │
│ │ De: 0x7099...79C8 (Producer)            │   │
│ │ Para: 0x3C44...93BC (Factory)           │   │
│ │ Cantidad: 5,000 unidades                │   │
│ │ Fecha: 9 dic. 2025, 12:30              │   │
│ └──────────────────────────────────────────┘   │
└────────────────────────────────────────────────┘
```

---

## 🎨 Características del Modal

### Diseño
- ✅ Modal full-screen responsive
- ✅ Header verde con título y nombre del token
- ✅ Scrolleable para cadenas largas
- ✅ Numeración descendente (3 → 2 → 1)
- ✅ Líneas conectoras entre tokens
- ✅ Badges de rol con iconos (🌾 🏭 🏪 🛒)
- ✅ Colores diferenciados por sección
- ✅ Botón de cerrar (✕) en el header

### Información Mostrada
- ✅ Toda la cadena desde el token actual hasta el origen
- ✅ Detalles completos de cada token
- ✅ Características en formato JSON legible
- ✅ Todas las transferencias aceptadas
- ✅ Direcciones formateadas (0x1234...abcd)
- ✅ Fechas en formato local (español)

---

## 🚀 Cómo Usar

### Para Consumer (Usuario Final)

1. **Ir a "Mis Tokens"** desde el dashboard
2. **Ver tus tokens** recibidos
3. **Click en "🔍 Ver Trazabilidad"** en cualquier token
4. **Explorar la cadena completa**:
   - Ver de dónde viene el producto
   - Revisar todas las características de cada etapa
   - Ver quién lo creó y quién lo transportó
   - Verificar fechas y cantidades

### Para Producer, Factory, Retailer

Funciona igual:
1. Ir a "Mis Tokens"
2. Click en "🔍 Ver Trazabilidad" en cualquier token
3. Ver toda la cadena, incluyendo tokens padre

---

## 📝 Beneficios

### Para el Consumer:
✅ **Transparencia total**: Ve todo el camino del producto
✅ **Verificación**: Puede verificar origen, calidad, certificaciones
✅ **Confianza**: Conoce cada paso de la cadena
✅ **Información completa**: Características técnicas de cada etapa

### Para Producer, Factory, Retailer:
✅ **Trazabilidad hacia atrás**: Ver de dónde vienen sus materias primas
✅ **Auditoría**: Verificar la cadena completa
✅ **Documentación**: Tener registro completo del proceso

---

## 🔧 Detalles Técnicos

### Función `getTokenTraceability()`

**Ubicación**: [web/lib/web3.ts:205](web/lib/web3.ts#L205)

**Algoritmo**:
```javascript
1. Empezar con el tokenId solicitado
2. Mientras currentTokenId !== 0:
   a. Obtener información del token
   b. Obtener información del creador (role, address)
   c. Buscar todas las transferencias aceptadas del token
   d. Agregar todo a un array
   e. Actualizar currentTokenId = token.parentId
3. Retornar array completo de trazabilidad
```

**Manejo de Errores**:
- ✅ Maneja creadores que no están registrados (admin)
- ✅ Ignora transferencias inválidas
- ✅ Continúa aunque un token intermedio falle
- ✅ Retorna lo que pudo obtener

### Performance

La función hace múltiples llamadas al contrato:
- 1 llamada por cada token en la cadena
- 1 llamada por cada usuario creador
- N llamadas para buscar transferencias (donde N = nextTransferId)

**Optimización**: La función usa try-catch para continuar aunque alguna llamada falle.

---

## ⚙️ Configuración

No se requiere configuración adicional. La funcionalidad está lista para usar inmediatamente.

### Requisitos:
- ✅ Usuario conectado con MetaMask
- ✅ Usuario aprobado en el sistema
- ✅ Tokens en posesión del usuario
- ✅ Contrato desplegado y funcionando

---

## 🎯 Casos de Uso

### Caso 1: Consumer verifica origen del producto
**Escenario**: Un consumer recibe un "Pack Batería Premium"
**Acción**: Click en "Ver Trazabilidad"
**Resultado**: Ve que el litio viene de Bolivia con certificación ISO-9001, la batería fue manufacturada con especificaciones exactas, y el pack fue empaquetado por un retailer confiable.

### Caso 2: Retailer audita su inventario
**Escenario**: Retailer quiere verificar la calidad de los productos recibidos
**Acción**: Click en "Ver Trazabilidad" en las baterías recibidas
**Resultado**: Puede verificar que las baterías realmente derivan de litio de alta pureza (99.5%)

### Caso 3: Factory revisa materias primas
**Escenario**: Factory recibió litio y quiere verificar su origen
**Acción**: Click en "Ver Trazabilidad" en el token de litio
**Resultado**: Ve el lote exacto, fecha de extracción, y certificación del productor

---

## 📊 Ejemplo Completo de Uso

### Paso a Paso

1. **Consumer conecta wallet** (cuenta #4: `0x15d3...C6A65`)
2. **Va a "Mis Tokens"**
3. **Ve su token**: "Pack Batería Premium" (10 unidades)
4. **Click en "🔍 Ver Trazabilidad"**
5. **Modal se abre** mostrando:
   - Token #3: Pack Batería Premium (Retailer)
   - Token #2: Batería Ion-Litio 3.7V (Factory)
   - Token #1: Carbonato de Litio (Producer)
6. **Consumer puede ver**:
   - Origen: Salar de Uyuni, Bolivia
   - Pureza: 99.5%
   - Voltaje: 3.7V
   - Capacidad: 3000mAh
   - Garantía: 12 meses
   - Toda la cadena de transferencias

---

## ✅ Estado del Sistema

**Implementación**: ✅ Completada
**Testing**: ⚠️ Pendiente (requiere datos en blockchain)
**Documentación**: ✅ Completada
**UI/UX**: ✅ Modal responsive y visualmente atractivo

---

## 🔜 Próximos Pasos

1. **Registrar usuarios** correctamente siguiendo [PASOS_REGISTRO_CORRECTO.md](PASOS_REGISTRO_CORRECTO.md)
2. **Crear cadena de tokens** completa:
   - Producer → Carbonato de Litio
   - Factory → Batería Ion-Litio
   - Retailer → Pack Batería Premium
   - Consumer → Recibe pack
3. **Probar funcionalidad** de trazabilidad
4. **Verificar** que todos los datos se muestran correctamente

---

**Fecha**: 9 de Diciembre de 2025
**Versión**: 1.7.0
**Feature**: Trazabilidad Completa ✅
**Estado**: Listo para Testing 🚀
