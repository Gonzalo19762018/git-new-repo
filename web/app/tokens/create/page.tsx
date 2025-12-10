"use client";

import { useWeb3, UserStatus } from "@/contexts/Web3Context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { web3Service } from "@/lib/web3";

export default function CreateTokenPage() {
  const { isConnected, isAdmin, user, account } = useWeb3();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    totalSupply: "",
    features: "",
    parentId: "0",
  });

  useEffect(() => {
    // Si es Admin, redirigir al dashboard
    if (isAdmin) {
      router.push("/dashboard");
      return;
    }

    if (!isConnected || !user || user.status !== UserStatus.Approved) {
      router.push("/");
    }
  }, [isConnected, isAdmin, user, router]);

  // Verificar que el usuario pueda crear tokens
  const canCreateToken = user?.role === "Producer" || user?.role === "Factory" || user?.role === "Retailer";

  const getRoleIcon = (role: string) => {
    const icons: { [key: string]: string } = {
      Producer: "🌾",
      Factory: "🏭",
      Retailer: "🏪",
      Consumer: "🛒",
    };
    return icons[role] || "👤";
  };

  const getTokenTypeLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      Producer: "Materia Prima",
      Factory: "Producto Manufacturado",
      Retailer: "Producto para Venta",
      Consumer: "N/A",
    };
    return labels[role] || "Token";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("El nombre es requerido");
      return;
    }

    const supply = parseInt(formData.totalSupply);
    if (isNaN(supply) || supply <= 0) {
      setError("La cantidad debe ser un número mayor a 0");
      return;
    }

    try {
      setCreating(true);

      // Crear el objeto de características
      const features = formData.features.trim()
        ? formData.features
        : JSON.stringify({
            description: "Sin características adicionales",
            createdBy: account
          });

      await web3Service.createToken(
        formData.name,
        supply,
        features,
        parseInt(formData.parentId)
      );

      setSuccess("Token creado exitosamente!");

      // Limpiar formulario
      setFormData({
        name: "",
        totalSupply: "",
        features: "",
        parentId: "0",
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/tokens");
      }, 2000);

    } catch (error: any) {
      console.error("Error creating token:", error);
      setError(error.message || error.reason || "Error al crear el token");
    } finally {
      setCreating(false);
    }
  };

  const handleDisconnect = () => {
    router.push("/");
  };

  if (!user || !canCreateToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">
            Solo Producer, Factory y Retailer pueden crear tokens.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Volver al Dashboard
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
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">➕</div>
            <h1 className="text-3xl font-bold mb-2">Crear Nuevo Token</h1>
            <p className="text-gray-600">
              Tipo: <span className="font-semibold">{getTokenTypeLabel(user.role)}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Token *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Trigo, Harina, Pan Integral"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={creating}
              />
              <p className="text-xs text-gray-500 mt-1">
                Nombre descriptivo del producto o materia prima
              </p>
            </div>

            {/* Total Supply */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad Total *
              </label>
              <input
                type="number"
                value={formData.totalSupply}
                onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
                placeholder="1000"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={creating}
              />
              <p className="text-xs text-gray-500 mt-1">
                Cantidad de unidades que poseerás inicialmente
              </p>
            </div>

            {/* Features (JSON) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Características (JSON)
              </label>
              <textarea
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder='{"origen": "Argentina", "tipo": "organico", "certificacion": "ISO-9001"}'
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                disabled={creating}
              />
              <p className="text-xs text-gray-500 mt-1">
                Información adicional en formato JSON (opcional)
              </p>
            </div>

            {/* Parent ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID del Token Padre
              </label>
              <input
                type="number"
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={creating}
              />
              <p className="text-xs text-gray-500 mt-1">
                0 si es un token original, o el ID del token del que deriva (ej: Harina deriva de Trigo)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {creating ? "Creando..." : "Crear Token"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                disabled={creating}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• El token será creado en el blockchain</li>
              <li>• Recibirás la cantidad total especificada</li>
              <li>• Podrás transferir tokens a otros usuarios según tu rol</li>
              <li>• La transacción requiere confirmación en MetaMask</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
