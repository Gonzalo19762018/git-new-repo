# 🚀 Guía de Implementación del Frontend

## 📋 Resumen

Este documento contiene las instrucciones detalladas para implementar cada archivo del frontend siguiendo el plan de [INICIO.md](INICIO.md).

---

## 🔥 PASO 1: Exportar ABI del Contrato

### Archivo: `web/contracts/config.ts`

Primero necesitas copiar el ABI generado por Foundry:

```bash
# El ABI está en:
sc/out/SupplyChain.sol/SupplyChain.json
```

**Crea el archivo** `web/contracts/config.ts`:

```typescript
// Este es el ABI generado por Foundry - cópialo desde sc/out/SupplyChain.sol/SupplyChain.json
export const SUPPLY_CHAIN_ABI = [
  // ⚠️ IMPORTANTE: Pega aquí el array "abi" del archivo JSON generado por Foundry
  // Busca la propiedad "abi" en sc/out/SupplyChain.sol/SupplyChain.json
  // y copia todo el array
];

export const CONTRACT_CONFIG = {
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  abi: SUPPLY_CHAIN_ABI,
  adminAddress: process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
};

export const NETWORK_CONFIG = {
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "31337"),
  chainName: "Anvil Local",
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8545",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
};
```

**Cómo obtener el ABI:**

```bash
cd sc
forge build

# Copiar el contenido de la propiedad "abi" desde:
cat out/SupplyChain.sol/SupplyChain.json | jq '.abi' > ../web/contracts/abi.json
```

---

## 🔥 PASO 2: Servicio Web3

### Archivo: `web/lib/web3.ts`

```typescript
import { ethers, BrowserProvider, Contract } from "ethers";
import { CONTRACT_CONFIG, NETWORK_CONFIG } from "@/contracts/config";

export class Web3Service {
  private provider: BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: Contract | null = null;

  async connectWallet(): Promise<string> {
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask no está instalado");
    }

    // Solicitar acceso a MetaMask
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    // Verificar y cambiar a la red correcta si es necesario
    await this.switchNetwork();

    // Inicializar provider y signer
    this.provider = new BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    this.contract = new Contract(
      CONTRACT_CONFIG.address,
      CONTRACT_CONFIG.abi,
      this.signer
    );

    return accounts[0];
  }

  async switchNetwork(): Promise<void> {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // Si la red no existe, agregarla
      if (error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
              chainName: NETWORK_CONFIG.chainName,
              rpcUrls: [NETWORK_CONFIG.rpcUrl],
              nativeCurrency: NETWORK_CONFIG.nativeCurrency,
            },
          ],
        });
      } else {
        throw error;
      }
    }
  }

  getContract(): Contract {
    if (!this.contract) {
      throw new Error("Contrato no inicializado");
    }
    return this.contract;
  }

  async getAccount(): Promise<string> {
    if (!this.signer) {
      throw new Error("Wallet no conectado");
    }
    return await this.signer.getAddress();
  }

  // === FUNCIONES DEL CONTRATO ===

  // Usuarios
  async requestUserRole(role: string) {
    const contract = this.getContract();
    const tx = await contract.requestUserRole(role);
    return await tx.wait();
  }

  async changeStatusUser(userAddress: string, newStatus: number) {
    const contract = this.getContract();
    const tx = await contract.changeStatusUser(userAddress, newStatus);
    return await tx.wait();
  }

  async getUserInfo(userAddress: string) {
    const contract = this.getContract();
    const user = await contract.getUserInfo(userAddress);
    return {
      id: Number(user.id),
      userAddress: user.userAddress,
      role: user.role,
      status: Number(user.status),
    };
  }

  async isAdmin(userAddress: string): Promise<boolean> {
    const contract = this.getContract();
    return await contract.isAdmin(userAddress);
  }

  // Tokens
  async createToken(
    name: string,
    totalSupply: number,
    features: string,
    parentId: number
  ) {
    const contract = this.getContract();
    const tx = await contract.createToken(name, totalSupply, features, parentId);
    return await tx.wait();
  }

  async getToken(tokenId: number) {
    const contract = this.getContract();
    const token = await contract.getToken(tokenId);
    return {
      id: Number(token[0]),
      creator: token[1],
      name: token[2],
      totalSupply: Number(token[3]),
      features: token[4],
      parentId: Number(token[5]),
      dateCreated: Number(token[6]),
    };
  }

  async getTokenBalance(tokenId: number, userAddress: string): Promise<number> {
    const contract = this.getContract();
    const balance = await contract.getTokenBalance(tokenId, userAddress);
    return Number(balance);
  }

  async getUserTokens(userAddress: string): Promise<number[]> {
    const contract = this.getContract();
    const tokens = await contract.getUserTokens(userAddress);
    return tokens.map((t: bigint) => Number(t));
  }

  // Transferencias
  async transfer(to: string, tokenId: number, amount: number) {
    const contract = this.getContract();
    const tx = await contract.transfer(to, tokenId, amount);
    return await tx.wait();
  }

  async acceptTransfer(transferId: number) {
    const contract = this.getContract();
    const tx = await contract.acceptTransfer(transferId);
    return await tx.wait();
  }

  async rejectTransfer(transferId: number) {
    const contract = this.getContract();
    const tx = await contract.rejectTransfer(transferId);
    return await tx.wait();
  }

  async getTransfer(transferId: number) {
    const contract = this.getContract();
    const transfer = await contract.getTransfer(transferId);
    return {
      id: Number(transfer.id),
      from: transfer.from,
      to: transfer.to,
      tokenId: Number(transfer.tokenId),
      dateCreated: Number(transfer.dateCreated),
      amount: Number(transfer.amount),
      status: Number(transfer.status),
    };
  }

  async getUserTransfers(userAddress: string): Promise<number[]> {
    const contract = this.getContract();
    const transfers = await contract.getUserTransfers(userAddress);
    return transfers.map((t: bigint) => Number(t));
  }
}

// Instancia singleton
export const web3Service = new Web3Service();

// Type para window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
```

---

## 🔥 PASO 3: Contexto Web3

### Archivo: `web/contexts/Web3Context.tsx`

```typescript
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { web3Service } from "@/lib/web3";

export enum UserStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Canceled = 3,
}

interface User {
  id: number;
  userAddress: string;
  role: string;
  status: UserStatus;
}

interface Web3ContextType {
  account: string | null;
  user: User | null;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshUser: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar sesión desde localStorage al iniciar
  useEffect(() => {
    const loadSession = async () => {
      const savedAccount = localStorage.getItem("connectedAccount");
      if (savedAccount && typeof window.ethereum !== "undefined") {
        try {
          const provider = new (await import("ethers")).BrowserProvider(
            window.ethereum
          );
          const accounts = await provider.listAccounts();

          if (accounts.length > 0 && accounts[0].address === savedAccount) {
            await connectWallet();
          } else {
            localStorage.removeItem("connectedAccount");
          }
        } catch (error) {
          console.error("Error loading session:", error);
          localStorage.removeItem("connectedAccount");
        }
      }
      setIsLoading(false);
    };

    loadSession();
  }, []);

  // Escuchar cambios de cuenta en MetaMask
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", () => window.location.reload());
    }

    return () => {
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      await loadUserInfo(accounts[0]);
    }
  };

  const loadUserInfo = async (address: string) => {
    try {
      const userInfo = await web3Service.getUserInfo(address);
      setUser(userInfo);
    } catch (error) {
      // Usuario no registrado
      setUser(null);
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      const address = await web3Service.connectWallet();
      setAccount(address);
      setIsConnected(true);
      localStorage.setItem("connectedAccount", address);

      await loadUserInfo(address);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setUser(null);
    setIsConnected(false);
    localStorage.removeItem("connectedAccount");
  };

  const refreshUser = async () => {
    if (account) {
      await loadUserInfo(account);
    }
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        user,
        isConnected,
        isLoading,
        connectWallet,
        disconnectWallet,
        refreshUser,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within Web3Provider");
  }
  return context;
}
```

---

## 🔥 PASO 4: Layout Principal

### Archivo: `web/app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/contexts/Web3Context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Supply Chain Tracker",
  description: "Trazabilidad descentralizada para cadenas de suministro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
```

---

## 🔥 PASO 5: Página Principal

### Archivo: `web/app/page.tsx`

```typescript
"use client";

import { useWeb3, UserStatus } from "@/contexts/Web3Context";
import { useState } from "react";
import { web3Service } from "@/lib/web3";

export default function Home() {
  const { account, user, isConnected, isLoading, connectWallet, refreshUser } = useWeb3();
  const [selectedRole, setSelectedRole] = useState<string>("Producer");
  const [requesting, setRequesting] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con MetaMask");
    }
  };

  const handleRequestRole = async () => {
    if (!selectedRole) return;

    try {
      setRequesting(true);
      await web3Service.requestUserRole(selectedRole);
      await refreshUser();
      alert("Solicitud enviada exitosamente. Espera la aprobación del administrador.");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al solicitar rol");
    } finally {
      setRequesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
          <h1 className="text-3xl font-bold mb-4 text-center">
            Supply Chain Tracker
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Sistema descentralizado de trazabilidad para cadenas de suministro
          </p>
          <button
            onClick={handleConnect}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition"
          >
            Conectar con MetaMask
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Registro de Usuario</h2>
          <p className="text-gray-600 mb-4">
            Conectado: {account?.slice(0, 6)}...{account?.slice(-4)}
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Selecciona tu rol:
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="Producer">Producer (Productor)</option>
              <option value="Factory">Factory (Fábrica)</option>
              <option value="Retailer">Retailer (Minorista)</option>
              <option value="Consumer">Consumer (Consumidor)</option>
            </select>
          </div>
          <button
            onClick={handleRequestRole}
            disabled={requesting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {requesting ? "Enviando..." : "Solicitar Rol"}
          </button>
        </div>
      </div>
    );
  }

  if (user.status === UserStatus.Pending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Solicitud Pendiente</h2>
          <p className="text-gray-600 mb-4">
            Tu solicitud como <strong>{user.role}</strong> está pendiente de aprobación por el administrador.
          </p>
          <div className="animate-pulse bg-yellow-200 p-4 rounded-lg">
            ⏳ Esperando aprobación...
          </div>
        </div>
      </div>
    );
  }

  if (user.status === UserStatus.Rejected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">
            Solicitud Rechazada
          </h2>
          <p className="text-gray-600">
            Tu solicitud como <strong>{user.role}</strong> fue rechazada por el administrador.
          </p>
        </div>
      </div>
    );
  }

  // Usuario aprobado - Redirigir a dashboard
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-green-600">
          ¡Bienvenido!
        </h2>
        <p className="text-gray-600 mb-4">
          Rol: <strong>{user.role}</strong>
        </p>
        <a
          href="/dashboard"
          className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition"
        >
          Ir al Dashboard
        </a>
      </div>
    </div>
  );
}
```

---

## 📝 PASO 6: Archivo .env.local

Crea el archivo `web/.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=PEGAR_DIRECCION_DEL_CONTRATO_DESPLEGADO
NEXT_PUBLIC_ADMIN_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=31337
```

---

## ✅ Testing

Una vez completados estos archivos:

```bash
cd web

# Verificar compilación
npm run build

# Ejecutar en desarrollo
npm run dev

# Abrir http://localhost:3000
```

---

## 📋 Archivos Restantes

Los siguientes archivos deben implementarse siguiendo el mismo patrón:

### Páginas
- `app/dashboard/page.tsx` - Dashboard personalizado por rol
- `app/tokens/page.tsx` - Lista de tokens
- `app/tokens/create/page.tsx` - Crear token
- `app/tokens/[id]/page.tsx` - Detalles del token
- `app/tokens/[id]/transfer/page.tsx` - Transferir token
- `app/transfers/page.tsx` - Gestión de transferencias
- `app/admin/page.tsx` - Panel admin
- `app/admin/users/page.tsx` - Gestión de usuarios
- `app/profile/page.tsx` - Perfil del usuario

### Componentes
- `components/Header.tsx` - Navegación principal
- `components/TokenCard.tsx` - Tarjeta de token
- `components/TransferList.tsx` - Lista de transferencias
- `components/UserTable.tsx` - Tabla de usuarios
- `components/ui/*` - Componentes base de UI

---

## 🎯 Orden de Implementación Recomendado

1. ✅ Completar archivos básicos (PASOS 1-6)
2. 🔨 Crear Header component
3. 🔨 Implementar Dashboard
4. 🔨 Implementar gestión de tokens
5. 🔨 Implementar transferencias
6. 🔨 Implementar panel admin
7. 🔨 Pulir UI y UX

---

## 📚 Referencias

- Smart Contract: `sc/src/SupplyChain.sol`
- Tests: `sc/test/SupplyChain.t.sol`
- Plan completo: `INICIO.md`
- Estado actual: `README.md`

---

**Siguiente archivo a implementar**: Después de completar los PASOS 1-6, continúa con el Header component y el Dashboard.
