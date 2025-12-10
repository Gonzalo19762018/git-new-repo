"use client";

import { useWeb3, UserStatus } from "@/contexts/Web3Context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { web3Service } from "@/lib/web3";

interface Token {
  id: number;
  creator: string;
  name: string;
  totalSupply: number;
  features: string;
  parentId: number;
  dateCreated: number;
  balance: number;
}

interface TraceabilityData {
  token: {
    id: number;
    name: string;
    totalSupply: number;
    features: string;
    parentId: number;
    dateCreated: number;
    creator: string;
  };
  creatorInfo: {
    role: string;
    userAddress: string;
  } | null;
  userBalance: number; // Balance del usuario actual en este token
  transfers: {
    id: number;
    from: string;
    to: string;
    amount: number;
    dateCreated: number;
  }[];
}

export default function TokensPage() {
  const { isConnected, isAdmin, user, account } = useWeb3();
  const router = useRouter();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTraceability, setShowTraceability] = useState(false);
  const [traceabilityData, setTraceabilityData] = useState<TraceabilityData[]>([]);
  const [loadingTraceability, setLoadingTraceability] = useState(false);
  const [selectedTokenName, setSelectedTokenName] = useState("");

  useEffect(() => {
    // Si es Admin, redirigir al dashboard
    if (isAdmin) {
      router.push("/dashboard");
      return;
    }

    if (!isConnected || !user || user.status !== UserStatus.Approved) {
      router.push("/");
      return;
    }
    loadTokens();
  }, [isConnected, isAdmin, user, account, router]);

  const loadTokens = async () => {
    if (!account) return;

    try {
      setLoading(true);
      setError("");

      // Obtener los IDs de tokens del usuario
      const tokenIds = await web3Service.getUserTokens(account);

      // Cargar información detallada de cada token
      const tokensData = await Promise.all(
        tokenIds.map(async (id) => {
          const token = await web3Service.getToken(id);
          const balance = await web3Service.getTokenBalance(id, account);
          return {
            ...token,
            balance,
          };
        })
      );

      setTokens(tokensData);
    } catch (error: any) {
      console.error("Error loading tokens:", error);
      setError("Error al cargar los tokens");
    } finally {
      setLoading(false);
    }
  };

  const handleViewTraceability = async (tokenId: number, tokenName: string) => {
    try {
      setLoadingTraceability(true);
      setSelectedTokenName(tokenName);
      setShowTraceability(true);

      const data = await web3Service.getTokenTraceability(tokenId);
      setTraceabilityData(data);
    } catch (error: any) {
      console.error("Error loading traceability:", error);
      setError("Error al cargar la trazabilidad");
      setShowTraceability(false);
    } finally {
      setLoadingTraceability(false);
    }
  };

  const getRoleIcon = (role: string) => {
    const icons: { [key: string]: string } = {
      Producer: "🌾",
      Factory: "🏭",
      Retailer: "🏪",
      Consumer: "🛒",
    };
    return icons[role] || "👤";
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const parseFeatures = (features: string) => {
    try {
      return JSON.parse(features);
    } catch {
      return { raw: features };
    }
  };

  const handleTransfer = (tokenId: number) => {
    router.push(`/tokens/${tokenId}/transfer`);
  };

  const handleDisconnect = () => {
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-2xl font-bold text-blue-600 hover:text-blue-700"
            >
              Supply Chain Tracker
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {getRoleIcon(user.role)} {user.role}
            </span>
            <span className="text-sm text-gray-600">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </span>
            <button
              onClick={handleDisconnect}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Desconectar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Tokens</h1>
            <p className="text-gray-600 mt-1">
              Gestiona tus tokens de la cadena de suministro
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadTokens}
              disabled={loading}
              className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <span>🔄</span>
              <span>Refrescar</span>
            </button>
            {(user.role === "Producer" || user.role === "Factory" || user.role === "Retailer") && (
              <button
                onClick={() => router.push("/tokens/create")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Crear Token</span>
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <div className="text-gray-600">Cargando tokens...</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && tokens.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No tienes tokens
            </h2>
            <p className="text-gray-600 mb-6">
              {user.role === "Consumer"
                ? "Aún no has recibido tokens. Los tokens aparecerán aquí cuando otros usuarios te los transfieran."
                : "Crea tu primer token para comenzar a rastrear productos en la cadena de suministro"}
            </p>
            {user.role !== "Consumer" && (
              <button
                onClick={() => router.push("/tokens/create")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Crear Token
              </button>
            )}
          </div>
        )}

        {/* Tokens Grid */}
        {!loading && tokens.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
              >
                {/* Token Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {token.name}
                    </h3>
                    <p className="text-sm text-gray-500">ID: #{token.id}</p>
                  </div>
                  <div className="text-3xl">📦</div>
                </div>

                {/* Balance */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-1">Balance</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {token.balance.toLocaleString()} unidades
                  </div>
                </div>

                {/* Token Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Supply Total:</span>
                    <span className="font-medium">{token.totalSupply.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Parent ID:</span>
                    <span className="font-medium">
                      {token.parentId === 0 ? "Original" : `#${token.parentId}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Creado:</span>
                    <span className="font-medium">{formatDate(token.dateCreated)}</span>
                  </div>
                </div>

                {/* Features */}
                {token.features && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Características:
                    </div>
                    <div className="bg-gray-50 rounded p-2 text-xs font-mono overflow-x-auto max-h-20 overflow-y-auto">
                      {JSON.stringify(parseFeatures(token.features), null, 2)}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {user.role === "Consumer" ? (
                  // Consumer solo puede ver trazabilidad
                  <div className="space-y-2">
                    <button
                      onClick={() => handleViewTraceability(token.id, token.name)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition text-sm flex items-center justify-center space-x-2"
                    >
                      <span>🔍</span>
                      <span>Ver Trazabilidad</span>
                    </button>
                  </div>
                ) : (
                  // Producer, Factory, Retailer pueden transferir
                  <>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        onClick={() => handleTransfer(token.id)}
                        disabled={token.balance === 0}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                      >
                        Transferir
                      </button>
                      <button
                        onClick={() => router.push(`/tokens/${token.id}`)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                      >
                        Detalles
                      </button>
                    </div>
                    <button
                      onClick={() => handleViewTraceability(token.id, token.name)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition text-sm flex items-center justify-center space-x-2"
                    >
                      <span>🔍</span>
                      <span>Ver Trazabilidad</span>
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Volver al Dashboard
          </button>
        </div>
      </main>

      {/* Modal de Trazabilidad */}
      {showTraceability && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">🔍 Trazabilidad Completa</h2>
                  <p className="text-green-100">{selectedTokenName}</p>
                </div>
                <button
                  onClick={() => setShowTraceability(false)}
                  className="text-white hover:bg-green-700 rounded-full p-2 transition"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingTraceability ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">⏳</div>
                  <div className="text-gray-600">Cargando trazabilidad...</div>
                </div>
              ) : traceabilityData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📭</div>
                  <div className="text-gray-600">No hay datos de trazabilidad</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {traceabilityData.map((item, index) => (
                    <div key={item.token.id} className="relative">
                      {/* Línea conectora */}
                      {index < traceabilityData.length - 1 && (
                        <div className="absolute left-8 top-full h-6 w-0.5 bg-gray-300 z-0"></div>
                      )}

                      {/* Card del token */}
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-green-300 transition relative z-10">
                        {/* Header del token */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-green-100 text-green-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                              {traceabilityData.length - index}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {item.token.name}
                              </h3>
                              <p className="text-sm text-gray-500">Token ID: #{item.token.id}</p>
                            </div>
                          </div>
                          {item.creatorInfo && (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                              {getRoleIcon(item.creatorInfo.role)} {item.creatorInfo.role}
                            </span>
                          )}
                        </div>

                        {/* Información del token */}
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-600">Creador:</span>
                            <p className="font-mono font-medium">
                              {formatAddress(item.token.creator)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Supply Total:</span>
                            <p className="font-medium">{item.token.totalSupply.toLocaleString()} unidades</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Creado:</span>
                            <p className="font-medium">{formatDate(item.token.dateCreated)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Token Padre:</span>
                            <p className="font-medium">
                              {item.token.parentId === 0 ? "Original" : `#${item.token.parentId}`}
                            </p>
                          </div>
                        </div>

                        {/* Balance del usuario (solo si tiene balance) */}
                        {item.userBalance > 0 && (
                          <div className="mb-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-blue-600 text-xl">💼</span>
                                <span className="text-sm font-medium text-blue-900">Tu Balance en este Token:</span>
                              </div>
                              <span className="text-lg font-bold text-blue-600">
                                {item.userBalance.toLocaleString()} unidades
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Características */}
                        {item.token.features && (
                          <div className="mb-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">
                              Características del Producto:
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono overflow-x-auto">
                              <pre>{JSON.stringify(parseFeatures(item.token.features), null, 2)}</pre>
                            </div>
                          </div>
                        )}

                        {/* Transferencias */}
                        {item.transfers.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">
                              Historial de Transferencias:
                            </div>
                            <div className="space-y-2">
                              {item.transfers.map((transfer) => (
                                <div
                                  key={transfer.id}
                                  className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-green-700">
                                      Transferencia #{transfer.id}
                                    </span>
                                    <span className="text-xs text-gray-600">
                                      {formatDate(transfer.dateCreated)}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className="text-gray-600">De:</span>
                                      <p className="font-mono font-medium">
                                        {formatAddress(transfer.from)}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Para:</span>
                                      <p className="font-mono font-medium">
                                        {formatAddress(transfer.to)}
                                      </p>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-gray-600">Cantidad:</span>
                                      <span className="ml-2 font-bold text-green-600">
                                        {transfer.amount.toLocaleString()} unidades
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t">
              <button
                onClick={() => setShowTraceability(false)}
                className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
