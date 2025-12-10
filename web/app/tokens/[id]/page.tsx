"use client";

import { useWeb3, UserStatus } from "@/contexts/Web3Context";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { web3Service } from "@/lib/web3";

interface TokenDetails {
  id: number;
  creator: string;
  name: string;
  totalSupply: number;
  features: string;
  parentId: number;
  dateCreated: number;
  balance: number;
}

interface Transfer {
  id: number;
  from: string;
  to: string;
  tokenId: number;
  dateCreated: number;
  amount: number;
  status: number;
}

enum TransferStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
}

export default function TokenDetailsPage() {
  const { isConnected, isAdmin, user, account } = useWeb3();
  const router = useRouter();
  const params = useParams();
  const tokenId = params.id ? Number(params.id) : null;

  const [token, setToken] = useState<TokenDetails | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

    if (tokenId) {
      loadTokenDetails();
    }
  }, [isConnected, isAdmin, user, account, tokenId, router]);

  const loadTokenDetails = async () => {
    if (!tokenId || !account) return;

    try {
      setLoading(true);
      setError("");

      // Cargar información del token
      const tokenInfo = await web3Service.getToken(tokenId);
      const balance = await web3Service.getTokenBalance(tokenId, account);

      setToken({
        ...tokenInfo,
        balance,
      });

      // Cargar transferencias del token
      const allTransferIds = await web3Service.getUserTransfers(account);
      const tokenTransfersData = await Promise.all(
        allTransferIds.map(async (id) => {
          const transfer = await web3Service.getTransfer(id);
          if (transfer.tokenId === tokenId) {
            return transfer;
          }
          return null;
        })
      );

      // Filtrar transferencias del token actual y ordenar
      const filtered = tokenTransfersData
        .filter((t): t is Transfer => t !== null)
        .sort((a, b) => b.dateCreated - a.dateCreated);

      setTransfers(filtered);
    } catch (error: any) {
      console.error("Error loading token details:", error);
      setError("Error al cargar los detalles del token");
    } finally {
      setLoading(false);
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

  const getStatusBadge = (status: number) => {
    const badges: Record<number, { bg: string; text: string; label: string; icon: string }> = {
      [TransferStatus.Pending]: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pendiente",
        icon: "⏳",
      },
      [TransferStatus.Accepted]: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Aceptada",
        icon: "✅",
      },
      [TransferStatus.Rejected]: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Rechazada",
        icon: "❌",
      },
    };

    const badge = badges[status] || badges[TransferStatus.Pending];

    return (
      <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-sm font-medium inline-flex items-center space-x-1`}>
        <span>{badge.icon}</span>
        <span>{badge.label}</span>
      </span>
    );
  };

  const handleDisconnect = () => {
    router.push("/");
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-gray-600">Cargando detalles del token...</div>
        </div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-600 mb-6">
            {error || "No se pudo cargar la información del token"}
          </p>
          <button
            onClick={() => router.push("/tokens")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Volver a Mis Tokens
          </button>
        </div>
      </div>
    );
  }

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
        {/* Back Button */}
        <button
          onClick={() => router.push("/tokens")}
          className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
        >
          <span>←</span>
          <span>Volver a Mis Tokens</span>
        </button>

        {/* Token Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-6xl">📦</div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    {token.name}
                  </h1>
                  <p className="text-gray-500 mt-1">Token ID: #{token.id}</p>
                </div>
              </div>

              {/* Balance destacado */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-6">
                <div className="text-sm opacity-90 mb-1">Tu Balance</div>
                <div className="text-5xl font-bold">
                  {token.balance.toLocaleString()}
                </div>
                <div className="text-sm opacity-90 mt-1">unidades disponibles</div>
              </div>

              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Supply Total</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {token.totalSupply.toLocaleString()}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Token Padre</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {token.parentId === 0 ? "Original" : `#${token.parentId}`}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Fecha de Creación</div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatDate(token.dateCreated)}
                  </div>
                </div>
              </div>

              {/* Creador */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-1">Creador</div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-lg font-medium text-gray-900">
                    {formatAddress(token.creator)}
                  </span>
                  {token.creator.toLowerCase() === account?.toLowerCase() && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      Tú
                    </span>
                  )}
                </div>
              </div>

              {/* Características */}
              {token.features && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    📋 Características
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(parseFeatures(token.features), null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push(`/tokens/${token.id}/transfer`)}
                  disabled={token.balance === 0}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  🔄 Transferir Token
                </button>
                <button
                  onClick={loadTokenDetails}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  🔄 Refrescar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Historial de Transferencias */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📜 Historial de Transferencias
          </h2>

          {transfers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📭</div>
              <p>No hay transferencias para este token</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transfers.map((transfer) => {
                const isIncoming = transfer.to.toLowerCase() === account?.toLowerCase();
                const isOutgoing = transfer.from.toLowerCase() === account?.toLowerCase();

                return (
                  <div
                    key={transfer.id}
                    className={`border-2 rounded-xl p-6 ${
                      isIncoming ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="text-2xl">
                            {isIncoming ? "📥" : "📤"}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900">
                            {isIncoming ? "Transferencia Recibida" : "Transferencia Enviada"}
                          </h3>
                          {getStatusBadge(transfer.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">De:</span>
                            <div className="font-mono font-medium mt-1">
                              {formatAddress(transfer.from)}
                              {isOutgoing && (
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  Tú
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <span className="text-gray-600">Para:</span>
                            <div className="font-mono font-medium mt-1">
                              {formatAddress(transfer.to)}
                              {isIncoming && (
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  Tú
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <span className="text-gray-600">Cantidad:</span>
                            <div className="font-bold text-blue-600 text-lg mt-1">
                              {transfer.amount.toLocaleString()} unidades
                            </div>
                          </div>

                          <div>
                            <span className="text-gray-600">Fecha:</span>
                            <div className="font-medium mt-1">
                              {formatDate(transfer.dateCreated)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Back Button Bottom */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/tokens")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Volver a Mis Tokens
          </button>
        </div>
      </main>
    </div>
  );
}
