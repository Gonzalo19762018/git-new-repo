#!/usr/bin/env node

/**
 * Script para aprobar usuarios en Supply Chain Tracker
 * Uso: node approve-user.js <direccion_usuario>
 */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Configuración
const RPC_URL = "http://localhost:8545";
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ADMIN_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Cargar ABI
const abiPath = path.join(__dirname, "web", "contracts", "abi.json");
const ABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));

// Estados de usuario
const UserStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
  Canceled: 3
};

async function main() {
  const userAddress = process.argv[2];

  if (!userAddress) {
    console.log("\n❌ Error: Debes proporcionar la dirección del usuario\n");
    console.log("Uso: node approve-user.js <direccion_usuario>\n");
    console.log("Ejemplo:");
    console.log("  node approve-user.js 0x70997970C51812dc3A010C7d01b50e0d17dc79C8\n");

    // Listar usuarios pendientes
    await listPendingUsers();
    process.exit(1);
  }

  try {
    console.log("\n🔗 Supply Chain Tracker - Aprobación de Usuario\n");
    console.log("=".repeat(60));

    // Conectar a la blockchain
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    // Verificar que somos admin
    const isAdmin = await contract.isAdmin(wallet.address);
    if (!isAdmin) {
      console.log("❌ Error: Esta cuenta no es el administrador");
      process.exit(1);
    }

    console.log(`✅ Cuenta admin: ${wallet.address}`);
    console.log(`📝 Contrato: ${CONTRACT_ADDRESS}`);
    console.log("=".repeat(60));

    // Obtener información del usuario
    let user;
    try {
      user = await contract.getUserInfo(userAddress);
    } catch (error) {
      console.log(`\n❌ Error: Usuario no encontrado: ${userAddress}`);
      console.log("   El usuario debe registrarse primero en la aplicación\n");
      process.exit(1);
    }

    // Mostrar información del usuario
    console.log("\n📋 Información del Usuario:");
    console.log("   Dirección:", userAddress);
    console.log("   Rol:", user.role);
    console.log("   Estado:", getStatusName(Number(user.status)));
    console.log("   ID:", Number(user.id));

    // Verificar si ya está aprobado
    if (Number(user.status) === UserStatus.Approved) {
      console.log("\n✅ Este usuario ya está aprobado\n");
      process.exit(0);
    }

    // Aprobar usuario
    console.log("\n🔄 Aprobando usuario...");
    const tx = await contract.changeStatusUser(userAddress, UserStatus.Approved);
    console.log("   Transacción enviada:", tx.hash);

    console.log("   Esperando confirmación...");
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      console.log("✅ Usuario aprobado exitosamente!");
      console.log("   Block:", receipt.blockNumber);
      console.log("   Gas usado:", Number(receipt.gasUsed));
    } else {
      console.log("❌ Error: La transacción falló");
    }

    // Verificar nuevo estado
    const updatedUser = await contract.getUserInfo(userAddress);
    console.log("\n📊 Estado Actualizado:");
    console.log("   Nuevo estado:", getStatusName(Number(updatedUser.status)));

    console.log("\n🎉 ¡Listo! El usuario puede usar la aplicación ahora");
    console.log("   Recarga la página en http://localhost:3000\n");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.reason) {
      console.error("   Razón:", error.reason);
    }
    process.exit(1);
  }
}

async function listPendingUsers() {
  try {
    console.log("\n📋 Listando usuarios pendientes...\n");

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    const nextUserId = await contract.nextUserId();
    const pendingUsers = [];

    for (let i = 1; i < Number(nextUserId); i++) {
      try {
        const user = await contract.users(i);
        if (Number(user.status) === UserStatus.Pending) {
          pendingUsers.push({
            id: Number(user.id),
            address: user.userAddress,
            role: user.role,
            status: Number(user.status)
          });
        }
      } catch (error) {
        // Usuario no existe, continuar
      }
    }

    if (pendingUsers.length === 0) {
      console.log("   No hay usuarios pendientes de aprobación\n");
      return;
    }

    console.log(`   Usuarios pendientes: ${pendingUsers.length}\n`);
    pendingUsers.forEach(u => {
      console.log(`   🔸 ID ${u.id}: ${u.address}`);
      console.log(`      Rol: ${u.role}`);
      console.log("");
    });

    console.log("Para aprobar un usuario, ejecuta:");
    console.log(`  node approve-user.js ${pendingUsers[0].address}\n`);

  } catch (error) {
    console.error("Error listando usuarios:", error.message);
  }
}

function getStatusName(status) {
  const names = ["Pending", "Approved", "Rejected", "Canceled"];
  return names[status] || "Unknown";
}

// Ejecutar
main().catch(console.error);
