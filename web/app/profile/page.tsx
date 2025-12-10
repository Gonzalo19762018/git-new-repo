"use client";

import { useWeb3, UserStatus } from "@/contexts/Web3Context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { web3Service } from "@/lib/web3";

export default function ProfilePage() {
  const { isConnected, user, account } = useWeb3();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalTokens: 0,
    totalTransfers: 0,
    pendingTransfers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isConnected || !user || user.status !== UserStatus.Approved) {
      router.push("/");
      return;
    }
    loadStats();
  }, [isConnected, user, account, router]);

  const loadStats = async () => {
    if (!account) return;

    try {
      setLoading(true);

      // Verificar si es admin
      const adminStatus = await web3Service.isAdmin(account);
      setIsAdmin(adminStatus);

      // Obtener tokens del usuario
      const tokenIds = await web3Service.getUserTokens(account);

      // Obtener transferencias del usuario
      const transferIds = await web3Service.getUserTransfers(account);

      // Cargar detalles de transferencias para contar pendientes
      const transfersData = await Promise.all(
        transferIds.map(async (id) => {
          return await web3Service.getTransfer(id);
        })
      );

      const pending = transfersData.filter(
        (t) => t.status === 0 && t.to.toLowerCase() === account.toLowerCase()
      ).length;

      setStats({
        totalTokens: tokenIds.length,
        totalTransfers: transferIds.length,
        pendingTransfers: pending,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
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

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      Producer: "from-green-400 to-green-600",
      Factory: "from-blue-400 to-blue-600",
      Retailer: "from-purple-400 to-purple-600",
      Consumer: "from-orange-400 to-orange-600",
    };
    return colors[role] || "from-gray-400 to-gray-600";
  };

  const getStatusBadge = (status: UserStatus) => {
    const badges: Record<UserStatus, { bg: string; text: string; label: string; icon: string }> = {
      [UserStatus.Pending]: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pendiente",
        icon: "⏳",
      },
      [UserStatus.Approved]: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Aprobado",
        icon: "✅",
      },
      [UserStatus.Rejected]: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Rechazado",
        icon: "❌",
      },
      [UserStatus.Canceled]: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Cancelado",
        icon: "🚫",
      },
    };

    const badge = badges[status];

    return (
      <span className={`${badge.bg} ${badge.text} px-4 py-2 rounded-full text-sm font-medium inline-flex items-center space-x-2`}>
        <span>{badge.icon}</span>
        <span>{badge.label}</span>
      </span>
    );
  };

  const getRolePermissions = (role: string) => {
    const permissions: { [key: string]: string[] } = {
      Producer: [
        "Crear tokens de materias primas",
        "Transferir tokens a Factory",
        "Ver historial de tokens",
        "Gestionar transferencias",
      ],
      Factory: [
        "Crear tokens de productos manufacturados",
        "Recibir tokens de Producer",
        "Transferir tokens a Retailer",
        "Crear tokens derivados (con parentId)",
        "Ver historial de tokens",
      ],
      Retailer: [
        "Crear tokens de productos para venta",
        "Recibir tokens de Factory",
        "Transferir tokens a Consumer",
        "Ver historial de tokens",
      ],
      Consumer: [
        "Recibir tokens de Retailer",
        "Ver historial de tokens recibidos",
        "Aceptar/Rechazar transferencias entrantes",
      ],
    };

    return permissions[role] || [];
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-1">
            Información detallada de tu cuenta y permisos
          </p>
        </div>

        {/* Profile Header Card */}
        <div className={`bg-gradient-to-r ${getRoleColor(user.role)} rounded-2xl shadow-2xl p-8 mb-8 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-8xl">{getRoleIcon(user.role)}</div>
              <div>
                <h2 className="text-4xl font-bold mb-2">{user.role}</h2>
                <p className="text-lg opacity-90 mb-3">
                  ID: #{user.id}
                </p>
                <div className="mb-2">
                  {getStatusBadge(user.status)}
                </div>
                {isAdmin && (
                  <div className="bg-yellow-500 bg-opacity-30 border border-yellow-300 px-3 py-1 rounded-full text-sm inline-block mt-2">
                    👑 Administrador
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Account Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Información de la Cuenta
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Dirección de Wallet
                  </label>
                  <div className="mt-1 bg-gray-50 rounded-lg p-3 font-mono text-sm break-all">
                    {account}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 font-medium">
                      Rol Asignado
                    </label>
                    <div className="mt-1 text-lg font-bold text-gray-900">
                      {getRoleIcon(user.role)} {user.role}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">
                      Estado de la Cuenta
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(user.status)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Permisos y Capacidades
              </h3>
              <p className="text-gray-600 mb-4">
                Como <strong>{user.role}</strong>, tienes los siguientes permisos:
              </p>
              <ul className="space-y-2">
                {getRolePermissions(user.role).map((permission, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">{permission}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Supply Chain Flow */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Flujo de la Cadena de Suministro
              </h3>
              <div className="flex flex-col space-y-4">
                <div className={`p-4 rounded-lg ${user.role === "Producer" ? "bg-green-100 border-2 border-green-500" : "bg-gray-50"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">🌾</span>
                      <div>
                        <div className="font-bold">Producer</div>
                        <div className="text-sm text-gray-600">Materias primas</div>
                      </div>
                    </div>
                    {user.role === "Producer" && (
                      <span className="text-green-600 font-bold">Tu rol actual</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="text-gray-400 text-2xl">↓</div>
                </div>

                <div className={`p-4 rounded-lg ${user.role === "Factory" ? "bg-blue-100 border-2 border-blue-500" : "bg-gray-50"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">🏭</span>
                      <div>
                        <div className="font-bold">Factory</div>
                        <div className="text-sm text-gray-600">Manufactura</div>
                      </div>
                    </div>
                    {user.role === "Factory" && (
                      <span className="text-blue-600 font-bold">Tu rol actual</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="text-gray-400 text-2xl">↓</div>
                </div>

                <div className={`p-4 rounded-lg ${user.role === "Retailer" ? "bg-purple-100 border-2 border-purple-500" : "bg-gray-50"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">🏪</span>
                      <div>
                        <div className="font-bold">Retailer</div>
                        <div className="text-sm text-gray-600">Venta al por menor</div>
                      </div>
                    </div>
                    {user.role === "Retailer" && (
                      <span className="text-purple-600 font-bold">Tu rol actual</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="text-gray-400 text-2xl">↓</div>
                </div>

                <div className={`p-4 rounded-lg ${user.role === "Consumer" ? "bg-orange-100 border-2 border-orange-500" : "bg-gray-50"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">🛒</span>
                      <div>
                        <div className="font-bold">Consumer</div>
                        <div className="text-sm text-gray-600">Consumidor final</div>
                      </div>
                    </div>
                    {user.role === "Consumer" && (
                      <span className="text-orange-600 font-bold">Tu rol actual</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-8">
            {/* Loading Stats */}
            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="text-4xl mb-2">⏳</div>
                <div className="text-gray-600">Cargando estadísticas...</div>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Estadísticas
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Mis Tokens</div>
                      <div className="text-3xl font-bold text-blue-600">
                        {stats.totalTokens}
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Transferencias Totales</div>
                      <div className="text-3xl font-bold text-green-600">
                        {stats.totalTransfers}
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Transferencias Pendientes</div>
                      <div className="text-3xl font-bold text-yellow-600">
                        {stats.pendingTransfers}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Acciones Rápidas
                  </h3>
                  <div className="space-y-3">
                    {user.role !== "Consumer" && (
                      <button
                        onClick={() => router.push("/tokens/create")}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition text-left flex items-center space-x-2"
                      >
                        <span>➕</span>
                        <span>Crear Token</span>
                      </button>
                    )}

                    <button
                      onClick={() => router.push("/tokens")}
                      className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition text-left flex items-center space-x-2"
                    >
                      <span>📦</span>
                      <span>Mis Tokens</span>
                    </button>

                    <button
                      onClick={() => router.push("/transfers")}
                      className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition text-left flex items-center space-x-2"
                    >
                      <span>🔄</span>
                      <span>Transferencias</span>
                    </button>

                    <button
                      onClick={() => router.push("/dashboard")}
                      className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition text-left flex items-center space-x-2"
                    >
                      <span>📊</span>
                      <span>Dashboard</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

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
