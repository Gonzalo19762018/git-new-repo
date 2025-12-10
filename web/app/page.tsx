"use client";

import { useWeb3, UserStatus } from "@/contexts/Web3Context";
import { useState } from "react";
import { web3Service } from "@/lib/web3";
import { ROLES } from "@/contracts/config";

export default function Home() {
  const { account, user, isAdmin, isConnected, isLoading, connectWallet, refreshUser } =
    useWeb3();
  const [selectedRole, setSelectedRole] = useState<string>(ROLES.PRODUCER);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setError(null);
      await connectWallet();
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "Error al conectar con MetaMask");
    }
  };

  const handleRequestRole = async () => {
    if (!selectedRole) return;

    try {
      setRequesting(true);
      setError(null);
      await web3Service.requestUserRole(selectedRole);
      await refreshUser();
      alert(
        "Solicitud enviada exitosamente. Espera la aprobación del administrador."
      );
    } catch (error: any) {
      console.error("Error:", error);

      // Manejar error de usuario ya registrado
      if (error.message?.includes("User already registered") ||
          error.reason?.includes("User already registered")) {
        setError("Ya estás registrado en el sistema. Recarga la página para ver tu estado.");
        // Intentar refrescar el usuario
        setTimeout(() => {
          refreshUser();
        }, 1000);
      } else {
        setError(error.message || error.reason || "Error al solicitar rol");
      }
    } finally {
      setRequesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Supply Chain Tracker
            </h1>
            <p className="text-gray-600 text-sm">
              Sistema descentralizado de trazabilidad
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">🔗</span>
              <div>
                <div className="font-semibold text-sm">Blockchain</div>
                <div className="text-xs text-gray-600">
                  Trazabilidad transparente
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <span className="text-2xl">🔐</span>
              <div>
                <div className="font-semibold text-sm">Seguro</div>
                <div className="text-xs text-gray-600">
                  Roles y permisos validados
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleConnect}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow-lg hover:shadow-xl"
          >
            Conectar con MetaMask
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Asegúrate de tener MetaMask instalado y Anvil corriendo
          </p>
        </div>
      </div>
    );
  }

  // Si es Admin, mostrar pantalla especial
  if (isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="mb-4">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">👑</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2 text-yellow-600">
            Administrador
          </h2>
          <p className="text-gray-600 mb-2">
            Conectado como <strong className="text-yellow-700">Admin</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6 font-mono">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </p>

          <div className="mb-6 p-4 bg-yellow-50 rounded-xl text-sm text-gray-700 text-left">
            <div className="font-semibold mb-2 text-yellow-800">📋 Funciones del Admin:</div>
            <div className="text-xs space-y-1">
              <div>✅ Aprobar usuarios registrados</div>
              <div>✅ Rechazar solicitudes de registro</div>
              <div>✅ Gestionar el sistema</div>
              <div>❌ NO crea tokens</div>
              <div>❌ NO transfiere tokens</div>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href="/dashboard"
              className="block w-full bg-yellow-600 text-white py-3 px-6 rounded-xl hover:bg-yellow-700 transition font-semibold shadow-lg"
            >
              Ir al Panel de Administración
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-2 text-center">
            Registro de Usuario
          </h2>
          <p className="text-gray-600 mb-6 text-center text-sm">
            Conectado: {account?.slice(0, 6)}...{account?.slice(-4)}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-gray-700">
              Selecciona tu rol:
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition"
            >
              <option value={ROLES.PRODUCER}>
                👨‍🌾 Producer (Productor)
              </option>
              <option value={ROLES.FACTORY}>🏭 Factory (Fábrica)</option>
              <option value={ROLES.RETAILER}>
                🏪 Retailer (Minorista)
              </option>
              <option value={ROLES.CONSUMER}>
                🛒 Consumer (Consumidor)
              </option>
            </select>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-xl text-sm text-gray-700">
            <div className="font-semibold mb-2">Flujo del sistema:</div>
            <div className="text-xs space-y-1">
              <div>👨‍🌾 Producer → 🏭 Factory</div>
              <div>🏭 Factory → 🏪 Retailer</div>
              <div>🏪 Retailer → 🛒 Consumer</div>
            </div>
          </div>

          <button
            onClick={handleRequestRole}
            disabled={requesting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition disabled:bg-gray-400 font-semibold shadow-lg disabled:cursor-not-allowed"
          >
            {requesting ? "Enviando..." : "Solicitar Rol"}
          </button>
        </div>
      </div>
    );
  }

  if (user.status === UserStatus.Pending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="mb-4">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⏳</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Solicitud Pendiente</h2>
          <p className="text-gray-600 mb-6">
            Tu solicitud como <strong className="text-yellow-600">{user.role}</strong> está
            pendiente de aprobación por el administrador.
          </p>
          <div className="animate-pulse bg-yellow-100 p-4 rounded-xl mb-4">
            <p className="font-medium text-yellow-800">
              Esperando aprobación del admin...
            </p>
          </div>
          <button
            onClick={refreshUser}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium mb-4"
          >
            🔄 Verificar Estado
          </button>
          <p className="text-xs text-gray-500">
            Dirección: {account?.slice(0, 6)}...{account?.slice(-4)}
          </p>
        </div>
      </div>
    );
  }

  if (user.status === UserStatus.Rejected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="mb-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">❌</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-red-600">
            Solicitud Rechazada
          </h2>
          <p className="text-gray-600">
            Tu solicitud como <strong>{user.role}</strong> fue rechazada por el
            administrador.
          </p>
        </div>
      </div>
    );
  }

  // Usuario aprobado
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <div className="mb-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-2 text-green-600">
          ¡Bienvenido!
        </h2>
        <p className="text-gray-600 mb-6">
          Rol: <strong className="text-green-700">{user.role}</strong>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          {account?.slice(0, 6)}...{account?.slice(-4)}
        </p>
        <div className="space-y-3">
          <a
            href="/dashboard"
            className="block w-full bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition font-semibold shadow-lg"
          >
            Ir al Dashboard
          </a>
          <div className="text-xs text-gray-500">
            Dashboard funcional próximamente
          </div>
        </div>
      </div>
    </div>
  );
}
