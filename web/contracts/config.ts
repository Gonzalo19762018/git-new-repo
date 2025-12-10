import ABI from './abi.json';

export const SUPPLY_CHAIN_ABI = ABI;

export const CONTRACT_CONFIG = {
  address: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3") as `0x${string}`,
  abi: SUPPLY_CHAIN_ABI,
  adminAddress: (process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266") as `0x${string}`,
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

export const ROLES = {
  PRODUCER: "Producer",
  FACTORY: "Factory",
  RETAILER: "Retailer",
  CONSUMER: "Consumer",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
