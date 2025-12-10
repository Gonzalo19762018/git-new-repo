#!/bin/bash

# Script para aprobar usuarios en Supply Chain Tracker
# Uso: ./approve-user.sh <direccion_usuario>

CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"
ADMIN_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
RPC_URL="http://localhost:8545"

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "================================================"
echo "  🔗 Supply Chain Tracker - Aprobar Usuario"
echo "================================================"
echo ""

# Verificar que se proporcionó una dirección
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Debes proporcionar la dirección del usuario${NC}"
    echo ""
    echo "Uso: ./approve-user.sh <direccion_usuario>"
    echo ""
    echo "Ejemplo:"
    echo "  ./approve-user.sh 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    echo ""

    # Listar usuarios pendientes
    echo "📋 Listando usuarios registrados..."
    echo ""

    cd sc
    NEXT_USER_ID=$(cast call $CONTRACT_ADDRESS "nextUserId()" --rpc-url $RPC_URL)
    NEXT_USER_ID_DEC=$((NEXT_USER_ID))

    if [ $NEXT_USER_ID_DEC -le 1 ]; then
        echo "   No hay usuarios registrados"
    else
        for ((i=1; i<$NEXT_USER_ID_DEC; i++)); do
            USER_DATA=$(cast call $CONTRACT_ADDRESS "users(uint256)" $i --rpc-url $RPC_URL 2>/dev/null)
            if [ ! -z "$USER_DATA" ]; then
                # Extraer dirección (segundo campo, 32 bytes después del ID)
                ADDRESS="0x${USER_DATA:90:40}"

                # Obtener información del usuario
                USER_INFO=$(cast call $CONTRACT_ADDRESS "getUserInfo(address)" $ADDRESS --rpc-url $RPC_URL 2>/dev/null)

                echo "   👤 Usuario ID $i: $ADDRESS"
            fi
        done
    fi
    echo ""
    exit 1
fi

USER_ADDRESS=$1

echo -e "${BLUE}📝 Contrato:${NC} $CONTRACT_ADDRESS"
echo -e "${BLUE}👤 Usuario:${NC} $USER_ADDRESS"
echo ""

cd sc

# Obtener información del usuario
echo "🔍 Obteniendo información del usuario..."
USER_INFO=$(cast call $CONTRACT_ADDRESS "getUserInfo(address)" $USER_ADDRESS --rpc-url $RPC_URL 2>&1)

if [[ $USER_INFO == *"User not found"* ]]; then
    echo -e "${RED}❌ Error: Usuario no encontrado${NC}"
    echo "   El usuario debe registrarse primero en la aplicación"
    exit 1
fi

echo ""
echo "📋 Estado actual: Pending (esperando aprobación)"
echo ""

# Aprobar usuario (status 1 = Approved)
echo "🔄 Aprobando usuario..."
TX_RESULT=$(cast send $CONTRACT_ADDRESS \
  "changeStatusUser(address,uint8)" \
  $USER_ADDRESS 1 \
  --private-key $ADMIN_PRIVATE_KEY \
  --rpc-url $RPC_URL 2>&1)

if [[ $TX_RESULT == *"status               1"* ]]; then
    echo -e "${GREEN}✅ Usuario aprobado exitosamente!${NC}"
    echo ""
    echo "📊 Detalles de la transacción:"
    echo "$TX_RESULT" | grep -E "(transactionHash|blockNumber|gasUsed)" | sed 's/^/   /'
    echo ""
    echo -e "${GREEN}🎉 ¡Listo! El usuario puede usar la aplicación ahora${NC}"
    echo "   Recarga la página en http://localhost:3000"
    echo ""
else
    echo -e "${RED}❌ Error al aprobar usuario${NC}"
    echo "$TX_RESULT"
    exit 1
fi
