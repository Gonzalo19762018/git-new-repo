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

  // Obtener todos los usuarios (para admin)
  async getAllUsers(): Promise<any[]> {
    const contract = this.getContract();
    const nextUserId = await contract.nextUserId();
    const users = [];

    for (let i = 1; i < Number(nextUserId); i++) {
      try {
        const user = await contract.users(i);
        users.push({
          id: Number(user.id),
          userAddress: user.userAddress,
          role: user.role,
          status: Number(user.status),
        });
      } catch (error) {
        console.error(`Error fetching user ${i}:`, error);
      }
    }

    return users;
  }

  // Obtener trazabilidad completa de un token
  async getTokenTraceability(tokenId: number): Promise<any[]> {
    const traceability = [];
    let currentTokenId = tokenId;

    // Obtener la cuenta del usuario actual
    const currentUserAddress = await this.getAccount();

    while (currentTokenId !== 0) {
      try {
        const token = await this.getToken(currentTokenId);

        // Obtener información del creador
        let creatorInfo = null;
        try {
          creatorInfo = await this.getUserInfo(token.creator);
        } catch (error) {
          console.log(`Creator ${token.creator} is not a registered user (might be admin)`);
        }

        // Obtener balance del usuario actual en este token
        let userBalance = 0;
        try {
          const contract = this.getContract();
          const balance = await contract.balanceOf(currentUserAddress, currentTokenId);
          userBalance = Number(balance);
        } catch (error) {
          console.log(`Could not fetch balance for token ${currentTokenId}`);
        }

        // Obtener transferencias del token
        const contract = this.getContract();
        const nextTransferId = await contract.nextTransferId();
        const transfers = [];

        for (let i = 1; i < Number(nextTransferId); i++) {
          try {
            const transfer = await this.getTransfer(i);
            if (transfer.tokenId === currentTokenId && transfer.status === 1) {
              transfers.push({
                id: transfer.id,
                from: transfer.from,
                to: transfer.to,
                amount: transfer.amount,
                dateCreated: transfer.dateCreated,
              });
            }
          } catch (error) {
            // Ignorar errores de transferencias individuales
          }
        }

        traceability.push({
          token: {
            id: token.id,
            name: token.name,
            totalSupply: token.totalSupply,
            features: token.features,
            parentId: token.parentId,
            dateCreated: token.dateCreated,
            creator: token.creator,
          },
          creatorInfo: creatorInfo,
          userBalance: userBalance, // Balance del usuario actual en este token
          transfers: transfers,
        });

        currentTokenId = token.parentId;
      } catch (error) {
        console.error(`Error fetching token ${currentTokenId}:`, error);
        break;
      }
    }

    return traceability;
  }

  // Obtener estadísticas generales del sistema (para Admin)
  async getSystemStatistics(): Promise<any> {
    const contract = this.getContract();

    try {
      // Obtener totales
      const nextTokenId = await contract.nextTokenId();
      const nextTransferId = await contract.nextTransferId();

      // Obtener todos los usuarios
      const users = await this.getAllUsers();

      // Contar usuarios por rol
      const usersByRole = {
        Producer: users.filter(u => u.role === "Producer").length,
        Factory: users.filter(u => u.role === "Factory").length,
        Retailer: users.filter(u => u.role === "Retailer").length,
        Consumer: users.filter(u => u.role === "Consumer").length,
      };

      // Contar usuarios por estado
      const usersByStatus = {
        Pending: users.filter(u => u.status === 0).length,
        Approved: users.filter(u => u.status === 1).length,
        Rejected: users.filter(u => u.status === 2).length,
        Canceled: users.filter(u => u.status === 3).length,
      };

      // Contar tokens
      const totalTokens = Number(nextTokenId) - 1;

      // Obtener todos los tokens para análisis
      const tokens = [];
      for (let i = 1; i <= totalTokens; i++) {
        try {
          const token = await this.getToken(i);
          tokens.push(token);
        } catch (error) {
          console.error(`Error fetching token ${i}:`, error);
        }
      }

      // Tokens por tipo (basado en parentId)
      const originalTokens = tokens.filter(t => t.parentId === 0).length;
      const derivedTokens = tokens.filter(t => t.parentId !== 0).length;

      // Contar transferencias
      const totalTransfers = Number(nextTransferId) - 1;

      // Obtener todas las transferencias para análisis
      const transfers = [];
      for (let i = 1; i <= totalTransfers; i++) {
        try {
          const transfer = await this.getTransfer(i);
          transfers.push(transfer);
        } catch (error) {
          console.error(`Error fetching transfer ${i}:`, error);
        }
      }

      // Transferencias por estado
      const transfersByStatus = {
        Pending: transfers.filter(t => t.status === 0).length,
        Accepted: transfers.filter(t => t.status === 1).length,
        Rejected: transfers.filter(t => t.status === 2).length,
      };

      // Calcular supply total en circulación
      const totalSupply = tokens.reduce((sum, token) => sum + token.totalSupply, 0);

      return {
        users: {
          total: users.length,
          byRole: usersByRole,
          byStatus: usersByStatus,
        },
        tokens: {
          total: totalTokens,
          original: originalTokens,
          derived: derivedTokens,
          totalSupply: totalSupply,
        },
        transfers: {
          total: totalTransfers,
          byStatus: transfersByStatus,
        },
        contract: {
          address: CONTRACT_CONFIG.address,
          admin: await contract.admin(),
        },
      };
    } catch (error) {
      console.error("Error getting system statistics:", error);
      throw error;
    }
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
