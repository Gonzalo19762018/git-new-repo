#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Dirección del contrato
CONTRACT="0x5FbDB2315678afecb367f032d93F642f64180aa3"
RPC="http://localhost:8545"

# Private keys
ADMIN_PK="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
PRODUCER_PK="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
FACTORY_PK="0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
RETAILER_PK="0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"
CONSUMER_PK="0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"

# Direcciones
PRODUCER_ADDR="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
FACTORY_ADDR="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
RETAILER_ADDR="0x90F79bf6EB2c4f870365E785982E1f101E93b906"
CONSUMER_ADDR="0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Supply Chain Tracker - Setup All Accounts     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar que Anvil esté corriendo
echo -e "${YELLOW}🔍 Verificando Anvil...${NC}"
if ! curl -s -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $RPC > /dev/null 2>&1; then
  echo -e "${RED}❌ Error: Anvil no está corriendo en $RPC${NC}"
  echo -e "${YELLOW}   Ejecuta 'anvil' en otra terminal primero${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Anvil está corriendo${NC}"
echo ""

# Registrar y aprobar Producer
echo -e "${BLUE}═══ 🌾 PRODUCER (Productor) ═══${NC}"
echo -e "${YELLOW}📝 Registrando Producer...${NC}"
cast send $CONTRACT "requestUserRole(string)" "Producer" \
  --private-key $PRODUCER_PK --rpc-url $RPC > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Producer registrado${NC}"
else
  echo -e "${YELLOW}⚠️  Producer ya estaba registrado${NC}"
fi
sleep 1

echo -e "${YELLOW}✅ Aprobando Producer...${NC}"
cast send $CONTRACT "changeStatusUser(address,uint8)" $PRODUCER_ADDR 1 \
  --private-key $ADMIN_PK --rpc-url $RPC > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Producer aprobado${NC}"
else
  echo -e "${YELLOW}⚠️  Producer ya estaba aprobado${NC}"
fi
echo ""
sleep 1

# Registrar y aprobar Factory
echo -e "${BLUE}═══ 🏭 FACTORY (Fábrica) ═══${NC}"
echo -e "${YELLOW}📝 Registrando Factory...${NC}"
cast send $CONTRACT "requestUserRole(string)" "Factory" \
  --private-key $FACTORY_PK --rpc-url $RPC > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Factory registrada${NC}"
else
  echo -e "${YELLOW}⚠️  Factory ya estaba registrada${NC}"
fi
sleep 1

echo -e "${YELLOW}✅ Aprobando Factory...${NC}"
cast send $CONTRACT "changeStatusUser(address,uint8)" $FACTORY_ADDR 1 \
  --private-key $ADMIN_PK --rpc-url $RPC > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Factory aprobada${NC}"
else
  echo -e "${YELLOW}⚠️  Factory ya estaba aprobada${NC}"
fi
echo ""
sleep 1

# Registrar y aprobar Retailer
echo -e "${BLUE}═══ 🏪 RETAILER (Minorista) ═══${NC}"
echo -e "${YELLOW}📝 Registrando Retailer...${NC}"
cast send $CONTRACT "requestUserRole(string)" "Retailer" \
  --private-key $RETAILER_PK --rpc-url $RPC > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Retailer registrado${NC}"
else
  echo -e "${YELLOW}⚠️  Retailer ya estaba registrado${NC}"
fi
sleep 1

echo -e "${YELLOW}✅ Aprobando Retailer...${NC}"
cast send $CONTRACT "changeStatusUser(address,uint8)" $RETAILER_ADDR 1 \
  --private-key $ADMIN_PK --rpc-url $RPC > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Retailer aprobado${NC}"
else
  echo -e "${YELLOW}⚠️  Retailer ya estaba aprobado${NC}"
fi
echo ""
sleep 1

# Registrar y aprobar Consumer
echo -e "${BLUE}═══ 🛒 CONSUMER (Consumidor) ═══${NC}"
echo -e "${YELLOW}📝 Registrando Consumer...${NC}"
cast send $CONTRACT "requestUserRole(string)" "Consumer" \
  --private-key $CONSUMER_PK --rpc-url $RPC > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Consumer registrado${NC}"
else
  echo -e "${YELLOW}⚠️  Consumer ya estaba registrado${NC}"
fi
sleep 1

echo -e "${YELLOW}✅ Aprobando Consumer...${NC}"
cast send $CONTRACT "changeStatusUser(address,uint8)" $CONSUMER_ADDR 1 \
  --private-key $ADMIN_PK --rpc-url $RPC > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Consumer aprobado${NC}"
else
  echo -e "${YELLOW}⚠️  Consumer ya estaba aprobado${NC}"
fi
echo ""

# Resumen final
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              🎉 ¡Setup Completado! 🎉              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Cuentas configuradas:${NC}"
echo -e "  👑 Admin:    0xf39F...2266 ${YELLOW}(no se registra, es admin automático)${NC}"
echo -e "  🌾 Producer: 0x7099...79C8"
echo -e "  🏭 Factory:  0x3C44...93BC"
echo -e "  🏪 Retailer: 0x90F7...b906"
echo -e "  🛒 Consumer: 0x15d3...6A65"
echo ""
echo -e "${YELLOW}Roles explicados:${NC}"
echo -e "  • ${GREEN}Admin${NC}: Gestiona el sistema (NO participa en la cadena)"
echo -e "  • ${GREEN}Producer${NC}: Crea materias primas → transfiere a Factory"
echo -e "  • ${GREEN}Factory${NC}: Procesa productos → transfiere a Retailer"
echo -e "  • ${GREEN}Retailer${NC}: Vende productos → transfiere a Consumer"
echo -e "  • ${GREEN}Consumer${NC}: Consumidor final (NO puede transferir)"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo -e "  1. Importar las 5 cuentas en MetaMask"
echo -e "  2. Ir a http://localhost:3000"
echo -e "  3. Conectar con cada cuenta para verificar"
echo ""
echo -e "${BLUE}Para más información:${NC}"
echo -e "  • ROLES_Y_FUNCIONALIDADES.md - Roles detallados"
echo -e "  • CONFIGURAR_CUENTAS.md - Guía de configuración"
echo ""
