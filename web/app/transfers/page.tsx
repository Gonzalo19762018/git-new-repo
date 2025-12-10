"use client";

import { useWeb3, UserStatus } from "@/contexts/Web3Context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { web3Service } from "@/lib/web3";

interface Transfer {
  id: number;
  from: string;
  to: string;
  tokenId: number;
  dateCreated: number;
  amount: number;
  status: number; // 0: Pending, 1: Accepted, 2: Rejected
  tokenName?: string;
}

enum TransferStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
}

export default function TransfersPage() {
  const { isConnected, isAdmin, user, account } = useWeb3();
  const router = useRouter();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [hasNewTransfers, setHasNewTransfers] = useState(false);

  // Auto-refresh cada 10 segundos
  useEffect(() => {
    if (!isConnected || !user || user.status !== UserStatus.Approved || isAdmin) {
      return;
    }

    const interval = setInterval(() => {
      console.log("🔄 Auto-refresh de transferencias...");
      loadTransfers(true); // true = silent refresh
    }, 10000); // 10 segundos

    return () => clearInterval(interval);
  }, [isConnected, user, account, isAdmin]);

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
    loadTransfers();
  }, [isConnected, isAdmin, user, account, router]);

  const loadTransfers = async (silent = false) => {
    if (!account) return;

    try {
      if (!silent) {
        setLoading(true);
      }
      setError("");

      // Guardar cantidad actual de transferencias pendientes
      const currentPendingCount = transfers.filter(
        t => t.status === TransferStatus.Pending && t.to.toLowerCase() === account.toLowerCase()
      ).length;

      // Obtener los IDs de transferencias del usuario
      const transferIds = await web3Service.getUserTransfers(account);

      // Cargar información detallada de cada transferencia
      const transfersData = await Promise.all(
        transferIds.map(async (id) => {
          const transfer = await web3Service.getTransfer(id);

          // Obtener nombre del token
          try {
            const token = await web3Service.getToken(transfer.tokenId);
            return {
              ...transfer,
              tokenName: token.name,
            };
          } catch {
            return {
              ...transfer,
              tokenName: `Token #${transfer.tokenId}`,
            };
          }
        })
      );

      // Ordenar: pendientes primero, luego por fecha
      const sorted = transfersData.sort((a, b) => {
        if (a.status === TransferStatus.Pending && b.status !== TransferStatus.Pending) return -1;
        if (a.status !== TransferStatus.Pending && b.status === TransferStatus.Pending) return 1;
        return b.dateCreated - a.dateCreated;
      });

      // Verificar si hay nuevas transferencias pendientes
      const newPendingCount = sorted.filter(
        t => t.status === TransferStatus.Pending && t.to.toLowerCase() === account.toLowerCase()
      ).length;

      if (silent && newPendingCount > currentPendingCount) {
        console.log(`✨ ${newPendingCount - currentPendingCount} nueva(s) transferencia(s) detectada(s)!`);
        setHasNewTransfers(true);
        // Auto-ocultar notificación después de 5 segundos
        setTimeout(() => setHasNewTransfers(false), 5000);
      }

      setTransfers(sorted);
      setLastRefresh(new Date());
    } catch (error: any) {
      console.error("Error loading transfers:", error);
      if (!silent) {
        setError("Error al cargar las transferencias");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadTransfers(false);
    setRefreshing(false);
  };

  const handleAccept = async (transferId: number) => {
    try {
      setProcessing(transferId);
      setError("");

      // Encontrar la transferencia para verificar
      const transfer = transfers.find(t => t.id === transferId);
      if (transfer && transfer.to.toLowerCase() !== account?.toLowerCase()) {
        setError(
          `⚠️ Error: Esta transferencia está destinada a ${formatAddress(transfer.to)}, pero estás conectado como ${formatAddress(account || "")}. Por favor, cambia a la cuenta correcta en MetaMask.`
        );
        setProcessing(null);
        return;
      }

      await web3Service.acceptTransfer(transferId);

      // Recargar transferencias
      await loadTransfers();

      alert("Transferencia aceptada exitosamente!");
    } catch (error: any) {
      console.error("Error accepting transfer:", error);

      // Mejorar mensaje de error para "Only recipient can accept"
      if (error.message?.includes("Only recipient can accept") ||
          error.reason?.includes("Only recipient can accept")) {
        setError(
          "⚠️ Solo el destinatario puede aceptar esta transferencia. Verifica que estés conectado con la cuenta correcta en MetaMask."
        );
      } else {
        setError(error.message || error.reason || "Error al aceptar la transferencia");
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (transferId: number) => {
    if (!confirm("¿Estás seguro de que deseas rechazar esta transferencia?")) {
      return;
    }

    try {
      setProcessing(transferId);
      setError("");

      await web3Service.rejectTransfer(transferId);

      // Recargar transferencias
      await loadTransfers();

      alert("Transferencia rechazada");
    } catch (error: any) {
      console.error("Error rejecting transfer:", error);
      setError(error.message || error.reason || "Error al rechazar la transferencia");
    } finally {
      setProcessing(null);
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

  const pendingTransfers = transfers.filter(t => t.status === TransferStatus.Pending);
  const incomingPending = pendingTransfers.filter(t => t.to.toLowerCase() === account?.toLowerCase());

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
            <h1 className="text-3xl font-bold text-gray-900">Transferencias</h1>
            <p className="text-gray-600 mt-1">
              Gestiona las transferencias entrantes y salientes de tokens
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Auto-refresh cada 10 segundos • Última actualización: {lastRefresh.toLocaleTimeString('es-ES')}
            </p>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={loading || refreshing}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className={refreshing ? "animate-spin" : ""}>🔄</span>
            <span>{refreshing ? "Actualizando..." : "Refrescar Ahora"}</span>
          </button>
        </div>

        {/* Notificación de nuevas transferencias */}
        {hasNewTransfers && (
          <div className="mb-6 bg-green-50 border-2 border-green-500 text-green-800 px-6 py-4 rounded-xl flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✨</span>
              <div>
                <div className="font-bold">¡Nueva transferencia detectada!</div>
                <div className="text-sm">Tienes nuevas transferencias pendientes de aceptar</div>
              </div>
            </div>
            <button
              onClick={() => setHasNewTransfers(false)}
              className="text-green-600 hover:text-green-800 text-xl font-bold"
            >
              ×
            </button>
          </div>
        )}

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
            <div className="text-gray-600">Cargando transferencias...</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && transfers.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔄</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No hay transferencias
            </h2>
            <p className="text-gray-600 mb-6">
              Las transferencias que envíes o recibas aparecerán aquí
            </p>
            <button
              onClick={() => router.push("/tokens")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Ver Mis Tokens
            </button>
          </div>
        )}

        {/* Transfers Content */}
        {!loading && transfers.length > 0 && (
          <div className="space-y-8">
            {/* Pending Incoming Transfers */}
            {incomingPending.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  📥 Transferencias Entrantes Pendientes ({incomingPending.length})
                </h2>
                <div className="space-y-4">
                  {incomingPending.map((transfer) => {
                    const isCorrectAccount = transfer.to.toLowerCase() === account?.toLowerCase();

                    return (
                    <div
                      key={transfer.id}
                      className={`bg-white rounded-xl shadow-lg p-6 border-2 ${
                        isCorrectAccount ? "border-yellow-200" : "border-red-300"
                      }`}
                    >
                      {/* Advertencia si no es la cuenta correcta */}
                      {!isCorrectAccount && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <span className="text-lg">⚠️</span>
                            <div className="text-sm text-red-700">
                              <div className="font-semibold mb-1">Cuenta incorrecta</div>
                              <div>
                                Esta transferencia está destinada a{" "}
                                <span className="font-mono font-bold">{formatAddress(transfer.to)}</span>.
                                Estás conectado como{" "}
                                <span className="font-mono font-bold">{formatAddress(account || "")}</span>.
                                <br />
                                Por favor, cambia a la cuenta correcta en MetaMask.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {transfer.tokenName}
                            </h3>
                            {getStatusBadge(transfer.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">De:</span>
                              <span className="ml-2 font-medium font-mono">
                                {formatAddress(transfer.from)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Para:</span>
                              <span className="ml-2 font-medium font-mono">
                                {formatAddress(transfer.to)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Cantidad:</span>
                              <span className="ml-2 font-bold text-blue-600">
                                {transfer.amount.toLocaleString()} unidades
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Token ID:</span>
                              <span className="ml-2 font-medium">#{transfer.tokenId}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-600">Fecha:</span>
                              <span className="ml-2 font-medium">
                                {formatDate(transfer.dateCreated)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleAccept(transfer.id)}
                          disabled={processing === transfer.id || !isCorrectAccount}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {processing === transfer.id ? "Procesando..." : "✅ Aceptar"}
                        </button>
                        <button
                          onClick={() => handleReject(transfer.id)}
                          disabled={processing === transfer.id || !isCorrectAccount}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {processing === transfer.id ? "Procesando..." : "❌ Rechazar"}
                        </button>
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>
            )}

            {/* All Transfers */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📋 Todas las Transferencias ({transfers.length})
              </h2>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID / Token
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          De → Para
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transfers.map((transfer) => {
                        const isIncoming = transfer.to.toLowerCase() === account?.toLowerCase();
                        const isOutgoing = transfer.from.toLowerCase() === account?.toLowerCase();

                        return (
                          <tr key={transfer.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                #{transfer.id}
                              </div>
                              <div className="text-sm text-gray-500">
                                {transfer.tokenName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                <div className={`font-mono ${isOutgoing ? 'font-bold text-red-600' : ''}`}>
                                  {formatAddress(transfer.from)}
                                  {isOutgoing && <span className="ml-1">(Tú)</span>}
                                </div>
                                <div className="text-gray-400">↓</div>
                                <div className={`font-mono ${isIncoming ? 'font-bold text-green-600' : ''}`}>
                                  {formatAddress(transfer.to)}
                                  {isIncoming && <span className="ml-1">(Tú)</span>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-blue-600">
                                {transfer.amount.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(transfer.dateCreated)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(transfer.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isIncoming && transfer.status === TransferStatus.Pending ? (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleAccept(transfer.id)}
                                    disabled={processing === transfer.id}
                                    className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                                  >
                                    {processing === transfer.id ? "..." : "Aceptar"}
                                  </button>
                                  <button
                                    onClick={() => handleReject(transfer.id)}
                                    disabled={processing === transfer.id}
                                    className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                                  >
                                    {processing === transfer.id ? "..." : "Rechazar"}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
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
    </div>
  );
}
