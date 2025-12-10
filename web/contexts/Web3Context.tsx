"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { web3Service } from "@/lib/web3";
import AccountChangeNotification from "@/components/AccountChangeNotification";

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
  isAdmin: boolean;
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar sesión desde localStorage al iniciar
  useEffect(() => {
    const loadSession = async () => {
      const savedAccount = localStorage.getItem("connectedAccount");
      if (savedAccount && typeof window.ethereum !== "undefined") {
        try {
          const { BrowserProvider } = await import("ethers");
          const provider = new BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();

          if (accounts.length > 0 && accounts[0].address.toLowerCase() === savedAccount.toLowerCase()) {
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
  }, [account]);

  const handleAccountsChanged = async (accounts: string[]) => {
    console.log("🔄 Cuenta cambiada detectada:", accounts);

    if (accounts.length === 0) {
      console.log("❌ No hay cuentas, desconectando...");
      disconnectWallet();
    } else {
      const newAccount = accounts[0];

      if (newAccount.toLowerCase() !== account?.toLowerCase()) {
        console.log("✅ Nueva cuenta detectada:", newAccount);
        console.log("📍 Cuenta anterior:", account);

        // Limpiar estado anterior
        setUser(null);
        setIsAdmin(false);

        // Forzar reconexión completa
        try {
          setIsLoading(true);

          // Reinicializar el servicio web3 con la nueva cuenta
          await web3Service.connectWallet();

          // Actualizar estado
          setAccount(newAccount);
          localStorage.setItem("connectedAccount", newAccount);

          // Cargar información de la nueva cuenta
          await loadUserInfo(newAccount);

          console.log("✅ Reconexión completada exitosamente");

          // Mostrar notificación al usuario
          if (typeof window !== "undefined") {
            const event = new CustomEvent("account-changed", {
              detail: { newAccount, oldAccount: account }
            });
            window.dispatchEvent(event);
          }
        } catch (error) {
          console.error("❌ Error en reconexión:", error);
          disconnectWallet();
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const loadUserInfo = async (address: string) => {
    try {
      // Verificar si es admin
      const adminStatus = await web3Service.isAdmin(address);
      setIsAdmin(adminStatus);

      // Si es admin, no intentar cargar info de usuario (admin no se registra)
      if (adminStatus) {
        setUser(null);
        return;
      }

      // Cargar info de usuario para roles normales
      const userInfo = await web3Service.getUserInfo(address);
      setUser(userInfo);
    } catch (error) {
      // Usuario no registrado
      setUser(null);
      setIsAdmin(false);
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
    setIsAdmin(false);
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
        isAdmin,
        isConnected,
        isLoading,
        connectWallet,
        disconnectWallet,
        refreshUser,
      }}
    >
      <AccountChangeNotification />
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
