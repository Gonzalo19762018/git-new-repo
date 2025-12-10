"use client";

import { useWeb3, UserStatus } from "@/contexts/Web3Context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { web3Service } from "@/lib/web3";

export default function Dashboard() {
  const { account, user, isAdmin, isConnected, isLoading, disconnectWallet } = useWeb3();
  const router = useRouter();
  const [tokens, setTokens] = useState<number[]>([]);
  const [transfers, setTransfers] = useState<number[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showSystemStats, setShowSystemStats] = useState(false);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Auto-refresh cada 15 segundos para usuarios normales
  useEffect(() => {
    if (!isLoading && isConnected && user && user.status === UserStatus.Approved && !isAdmin) {
      const interval = setInterval(() => {
        console.log("🔄 Auto-refresh dashboard...");
        loadUserData();
      }, 15000); // 15 segundos

      return () => clearInterval(interval);
    }
  }, [isLoading, isConnected, user, isAdmin, account]);

  useEffect(() => {
    // Verificar autenticación
    if (!isLoading && !isConnected) {
      router.push("/");
      return;
    }

    // Si es Admin, cargar datos de admin
    if (!isLoading && isAdmin && account) {
      loadAdminData();
      return;
    }

    // Verificar que el usuario esté aprobado
    if (!isLoading && user && user.status !== UserStatus.Approved) {
      router.push("/");
      return;
    }

    // Cargar datos del usuario normal
    if (account && user?.status === UserStatus.Approved) {
      loadUserData();
    }
  }, [isConnected, isLoading, isAdmin, user, account, router]);

  const loadUserData = async () => {
    if (!account) return;

    try {
      setLoadingData(true);
      const [userTokens, userTransfers] = await Promise.all([
        web3Service.getUserTokens(account),
        web3Service.getUserTransfers(account),
      ]);

      setTokens(userTokens);
      setTransfers(userTransfers);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadAdminData = async () => {
    try {
      setLoadingData(true);
      const users = await web3Service.getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadSystemStatistics = async () => {
    try {
      setLoadingStats(true);
      const stats = await web3Service.getSystemStatistics();
      setSystemStats(stats);
    } catch (error) {
      console.error("Error loading system statistics:", error);
      alert("Error al cargar estadísticas del sistema");
    } finally {
      setLoadingStats(false);
    }
  };

  const handleOpenSystemStats = async () => {
    setShowSystemStats(true);
    await loadSystemStatistics();
  };

  const handleDisconnect = () => {
    disconnectWallet();
    router.push("/");
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, string> = {
      Producer: "👨‍🌾",
      Factory: "🏭",
      Retailer: "🏪",
      Consumer: "🛒",
    };
    return icons[role] || "👤";
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      Producer: "from-green-500 to-emerald-600",
      Factory: "from-blue-500 to-cyan-600",
      Retailer: "from-purple-500 to-pink-600",
      Consumer: "from-orange-500 to-red-600",
    };
    return colors[role] || "from-gray-500 to-gray-600";
  };

  if (isLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Cargando Dashboard...</div>
        </div>
      </div>
    );
  }

  // Si es Admin, mostrar dashboard de admin
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Supply Chain Tracker - Admin
                </h1>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  👑 Administrador
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Admin</div>
                  <div className="text-xs font-mono text-gray-800">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                >
                  Desconectar
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  Panel de Administración
                </h2>
                <p className="text-white/90">
                  Gestiona usuarios y supervisa el sistema
                </p>
              </div>
              <div className="text-6xl">👑</div>
            </div>
          </div>

          {/* Botón Supervisar Sistema */}
          <div className="mb-8 flex justify-end">
            <button
              onClick={handleOpenSystemStats}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition flex items-center space-x-2 shadow-lg"
            >
              <span className="text-xl">📊</span>
              <span className="font-semibold">Supervisar Sistema</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Total Usuarios
                </h3>
                <span className="text-3xl">👥</span>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {allUsers.length}
              </div>
              <p className="text-sm text-gray-600">
                Usuarios en el sistema
              </p>
            </div>

            {/* Pending Users Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Pendientes
                </h3>
                <span className="text-3xl">⏳</span>
              </div>
              <div className="text-4xl font-bold text-yellow-600 mb-2">
                {allUsers.filter(u => u.status === UserStatus.Pending).length}
              </div>
              <p className="text-sm text-gray-600">
                Esperando aprobación
              </p>
            </div>

            {/* Approved Users Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Aprobados
                </h3>
                <span className="text-3xl">✅</span>
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {allUsers.filter(u => u.status === UserStatus.Approved).length}
              </div>
              <p className="text-sm text-gray-600">
                Usuarios activos
              </p>
            </div>

            {/* Canceled Users Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Cancelados
                </h3>
                <span className="text-3xl">🚫</span>
              </div>
              <div className="text-4xl font-bold text-gray-600 mb-2">
                {allUsers.filter(u => u.status === UserStatus.Canceled).length}
              </div>
              <p className="text-sm text-gray-600">
                Usuarios desconectados
              </p>
            </div>
          </div>

          {/* Admin Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">
              📋 Funciones del Administrador
            </h3>
            <div className="text-sm text-yellow-800 space-y-2">
              <p>✅ <strong>Aprobar usuarios</strong>: Cambiar estado de usuarios pendientes a aprobados</p>
              <p>✅ <strong>Rechazar solicitudes</strong>: Denegar acceso a usuarios pendientes</p>
              <p>🔄 <strong>Desconectar/Conectar usuarios</strong>: Toggle entre estados Aprobado ↔️ Cancelado</p>
              <p>✅ <strong>Supervisar sistema</strong>: Ver estadísticas y estado general</p>
              <p>❌ <strong>NO crea tokens</strong>: El admin NO participa en la cadena de suministro</p>
              <p>❌ <strong>NO transfiere</strong>: El admin solo gestiona, no opera tokens</p>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Gestión de Usuarios
            </h3>

            {allUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay usuarios registrados todavía
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Dirección</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{user.id}</td>
                        <td className="py-3 px-4 font-mono text-sm">
                          {user.userAddress.slice(0, 6)}...{user.userAddress.slice(-4)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {user.status === UserStatus.Pending && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                              Pendiente
                            </span>
                          )}
                          {user.status === UserStatus.Approved && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              Aprobado
                            </span>
                          )}
                          {user.status === UserStatus.Rejected && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                              Rechazado
                            </span>
                          )}
                          {user.status === UserStatus.Canceled && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                              Cancelado
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {user.status === UserStatus.Pending && (
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  try {
                                    await web3Service.changeStatusUser(user.userAddress, UserStatus.Approved);
                                    await loadAdminData();
                                    alert("Usuario aprobado exitosamente");
                                  } catch (error) {
                                    console.error("Error:", error);
                                    alert("Error al aprobar usuario");
                                  }
                                }}
                                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                              >
                                Aprobar
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await web3Service.changeStatusUser(user.userAddress, UserStatus.Rejected);
                                    await loadAdminData();
                                    alert("Usuario rechazado");
                                  } catch (error) {
                                    console.error("Error:", error);
                                    alert("Error al rechazar usuario");
                                  }
                                }}
                                className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                              >
                                Rechazar
                              </button>
                            </div>
                          )}
                          {user.status === UserStatus.Approved && (
                            <button
                              onClick={async () => {
                                try {
                                  await web3Service.changeStatusUser(user.userAddress, UserStatus.Canceled);
                                  await loadAdminData();
                                  alert("Usuario desconectado exitosamente");
                                } catch (error) {
                                  console.error("Error:", error);
                                  alert("Error al desconectar usuario");
                                }
                              }}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                            >
                              Desconectar
                            </button>
                          )}
                          {user.status === UserStatus.Rejected && (
                            <button
                              onClick={async () => {
                                try {
                                  await web3Service.changeStatusUser(user.userAddress, UserStatus.Canceled);
                                  await loadAdminData();
                                  alert("Usuario desconectado exitosamente");
                                } catch (error) {
                                  console.error("Error:", error);
                                  alert("Error al desconectar usuario");
                                }
                              }}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                            >
                              Desconectar
                            </button>
                          )}
                          {user.status === UserStatus.Canceled && (
                            <button
                              onClick={async () => {
                                try {
                                  await web3Service.changeStatusUser(user.userAddress, UserStatus.Approved);
                                  await loadAdminData();
                                  alert("Usuario conectado exitosamente");
                                } catch (error) {
                                  console.error("Error:", error);
                                  alert("Error al conectar usuario");
                                }
                              }}
                              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                            >
                              Conectar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>

        {/* Modal de Supervisión del Sistema */}
        {showSystemStats && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">📊 Supervisión del Sistema</h2>
                    <p className="text-blue-100">Estadísticas y Estado General</p>
                  </div>
                  <button
                    onClick={() => setShowSystemStats(false)}
                    className="text-white hover:bg-blue-700 rounded-full p-2 transition"
                  >
                    <span className="text-2xl">✕</span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingStats ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-gray-600">Cargando estadísticas...</div>
                  </div>
                ) : systemStats ? (
                  <div className="space-y-6">
                    {/* Información del Contrato */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="text-2xl mr-2">🔐</span>
                        Información del Contrato
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Dirección del Contrato:</span>
                          <p className="font-mono font-bold text-gray-900 break-all">
                            {systemStats.contract.address}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Admin:</span>
                          <p className="font-mono font-bold text-gray-900">
                            {systemStats.contract.admin}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas de Usuarios */}
                    <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="text-2xl mr-2">👥</span>
                        Estadísticas de Usuarios
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            {systemStats.users.total}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Total</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold text-green-600">
                            {systemStats.users.byStatus.Approved}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Aprobados</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold text-yellow-600">
                            {systemStats.users.byStatus.Pending}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Pendientes</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold text-gray-600">
                            {systemStats.users.byStatus.Canceled}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Cancelados</div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-700 mb-3">Usuarios por Rol</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="flex items-center space-x-2 bg-green-50 rounded-lg p-3">
                            <span className="text-2xl">🌾</span>
                            <div>
                              <div className="font-bold text-green-700">{systemStats.users.byRole.Producer}</div>
                              <div className="text-xs text-gray-600">Producers</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 bg-blue-50 rounded-lg p-3">
                            <span className="text-2xl">🏭</span>
                            <div>
                              <div className="font-bold text-blue-700">{systemStats.users.byRole.Factory}</div>
                              <div className="text-xs text-gray-600">Factories</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 bg-purple-50 rounded-lg p-3">
                            <span className="text-2xl">🏪</span>
                            <div>
                              <div className="font-bold text-purple-700">{systemStats.users.byRole.Retailer}</div>
                              <div className="text-xs text-gray-600">Retailers</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 bg-orange-50 rounded-lg p-3">
                            <span className="text-2xl">🛒</span>
                            <div>
                              <div className="font-bold text-orange-700">{systemStats.users.byRole.Consumer}</div>
                              <div className="text-xs text-gray-600">Consumers</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas de Tokens */}
                    <div className="bg-white border-2 border-purple-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="text-2xl mr-2">📦</span>
                        Estadísticas de Tokens
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold text-purple-600">
                            {systemStats.tokens.total}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Total Tokens</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold text-green-600">
                            {systemStats.tokens.original}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Originales</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            {systemStats.tokens.derived}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Derivados</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold text-yellow-600">
                            {systemStats.tokens.totalSupply.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Supply Total</div>
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-sm text-purple-800">
                          <p className="mb-2"><strong>Tokens Originales:</strong> Creados por Producer sin token padre (parentId = 0)</p>
                          <p><strong>Tokens Derivados:</strong> Creados por Factory/Retailer que derivan de otros tokens</p>
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas de Transferencias */}
                    <div className="bg-white border-2 border-green-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="text-2xl mr-2">🔄</span>
                        Estadísticas de Transferencias
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold text-green-600">
                            {systemStats.transfers.total}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Total</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold text-green-600">
                            {systemStats.transfers.byStatus.Accepted}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Aceptadas</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold text-yellow-600">
                            {systemStats.transfers.byStatus.Pending}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Pendientes</div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold text-red-600">
                            {systemStats.transfers.byStatus.Rejected}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Rechazadas</div>
                        </div>
                      </div>

                      {systemStats.transfers.total > 0 && (
                        <div className="mt-4 bg-green-50 rounded-lg p-4">
                          <div className="text-sm text-green-800">
                            <p className="mb-2">
                              <strong>Tasa de Éxito:</strong>{" "}
                              {((systemStats.transfers.byStatus.Accepted / systemStats.transfers.total) * 100).toFixed(1)}%
                            </p>
                            <p>
                              <strong>Estado del Sistema:</strong>{" "}
                              {systemStats.transfers.byStatus.Pending > 0
                                ? `${systemStats.transfers.byStatus.Pending} transferencia(s) esperando aprobación`
                                : "Todas las transferencias procesadas"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Resumen General */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="text-2xl mr-2">📋</span>
                        Resumen General
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white rounded-lg p-4">
                          <div className="font-semibold text-gray-700 mb-2">Estado del Sistema</div>
                          <div className="text-green-600 font-bold">✅ Operativo</div>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <div className="font-semibold text-gray-700 mb-2">Actividad</div>
                          <div className="text-blue-600 font-bold">
                            {systemStats.users.byStatus.Approved} usuarios activos
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <div className="font-semibold text-gray-700 mb-2">Cadena de Suministro</div>
                          <div className="text-purple-600 font-bold">
                            {systemStats.tokens.total} productos rastreados
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No hay estadísticas disponibles
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Última actualización: {new Date().toLocaleString("es-ES")}
                </div>
                <button
                  onClick={() => setShowSystemStats(false)}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition font-medium"
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

  if (!user || user.status !== UserStatus.Approved) {
    return null; // El useEffect se encargará de redirigir
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Supply Chain Tracker
              </h1>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {getRoleIcon(user.role)} {user.role}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Conectado</div>
                <div className="text-xs font-mono text-gray-800">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
              >
                Desconectar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div
          className={`bg-gradient-to-r ${getRoleColor(
            user.role
          )} rounded-2xl shadow-lg p-8 mb-8 text-white`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                ¡Bienvenido, {user.role}!
              </h2>
              <p className="text-white/90">
                Gestiona tu cadena de suministro de forma descentralizada
              </p>
            </div>
            <div className="text-6xl">{getRoleIcon(user.role)}</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Tokens Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Mis Tokens
              </h3>
              <span className="text-3xl">📦</span>
            </div>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {tokens.length}
            </div>
            <p className="text-sm text-gray-600">
              {tokens.length === 1 ? "Token registrado" : "Tokens registrados"}
            </p>
          </div>

          {/* Transfers Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Transferencias
              </h3>
              <span className="text-3xl">🔄</span>
            </div>
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {transfers.length}
            </div>
            <p className="text-sm text-gray-600">
              {transfers.length === 1
                ? "Transferencia total"
                : "Transferencias totales"}
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Estado</h3>
              <span className="text-3xl">✅</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-2">
              Activo
            </div>
            <p className="text-sm text-gray-600">Usuario aprobado y operativo</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Create Token - Solo para roles que pueden crear */}
            {user.role !== "Consumer" && (
              <button
                onClick={() => router.push("/tokens/create")}
                className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition group"
              >
                <span className="text-3xl group-hover:scale-110 transition">
                  ➕
                </span>
                <div className="text-left">
                  <div className="font-semibold text-gray-800">
                    Crear Token
                  </div>
                  <div className="text-xs text-gray-600">Nuevo producto</div>
                </div>
              </button>
            )}

            {/* View Tokens */}
            <button
              onClick={() => router.push("/tokens")}
              className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition group"
            >
              <span className="text-3xl group-hover:scale-110 transition">
                📦
              </span>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Mis Tokens</div>
                <div className="text-xs text-gray-600">Ver inventario</div>
              </div>
            </button>

            {/* Transfers */}
            <button
              onClick={() => router.push("/transfers")}
              className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition group"
            >
              <span className="text-3xl group-hover:scale-110 transition">
                🔄
              </span>
              <div className="text-left">
                <div className="font-semibold text-gray-800">
                  Transferencias
                </div>
                <div className="text-xs text-gray-600">Gestionar envíos</div>
              </div>
            </button>

            {/* Profile */}
            <button
              onClick={() => router.push("/profile")}
              className="flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition group"
            >
              <span className="text-3xl group-hover:scale-110 transition">
                👤
              </span>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Mi Perfil</div>
                <div className="text-xs text-gray-600">Ver información</div>
              </div>
            </button>
          </div>
        </div>

        {/* Role-specific Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📋 Información de tu Rol: {user.role}
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            {user.role === "Producer" && (
              <>
                <p>
                  ✅ Puedes crear tokens de <strong>materias primas</strong>
                </p>
                <p>
                  ✅ Puedes transferir tokens a <strong>Factory</strong>
                </p>
                <p>❌ No puedes transferir directamente a Retailer o Consumer</p>
              </>
            )}
            {user.role === "Factory" && (
              <>
                <p>
                  ✅ Puedes crear tokens de <strong>productos derivados</strong>
                </p>
                <p>
                  ✅ Recibes materias primas de <strong>Producer</strong>
                </p>
                <p>
                  ✅ Puedes transferir productos a <strong>Retailer</strong>
                </p>
                <p>❌ No puedes transferir directamente a Consumer</p>
              </>
            )}
            {user.role === "Retailer" && (
              <>
                <p>
                  ✅ Puedes crear tokens de <strong>productos empaquetados</strong>
                </p>
                <p>
                  ✅ Recibes productos de <strong>Factory</strong>
                </p>
                <p>
                  ✅ Puedes transferir productos a <strong>Consumer</strong>
                </p>
              </>
            )}
            {user.role === "Consumer" && (
              <>
                <p>✅ Recibes productos finales de <strong>Retailer</strong></p>
                <p>✅ Puedes consultar la trazabilidad completa</p>
                <p>❌ No puedes crear tokens</p>
                <p>❌ No puedes transferir tokens</p>
              </>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
