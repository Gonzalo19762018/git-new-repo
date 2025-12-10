"use client";

import { useWeb3, UserStatus } from "@/contexts/Web3Context";
import { useRouter, useParams } from "next/navigation";
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

export default function TransferTokenPage() {
  const { isConnected, user, account } = useWeb3();
  const router = useRouter();
  const params = useParams();
  const tokenId = parseInt(params.id as string);

  const [token, setToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    to: "",
    amount: "",
  });

  const [useQuickSelect, setUseQuickSelect] = useState(true);

  // Direcciones conocidas de las cuentas de Anvil
  const knownAddresses = {
    Factory: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    Retailer: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    Consumer: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
  };

  useEffect(() => {
    if (!isConnected || !user || user.status !== UserStatus.Approved) {
      router.push("/");
      return;
    }
    loadToken();
  }, [isConnected, user, account, router, tokenId]);

  const loadToken = async () => {
    if (!account) return;

    try {
      setLoading(true);
      const tokenData = await web3Service.getToken(tokenId);
      const balance = await web3Service.getTokenBalance(tokenId, account);

      setToken({
        ...tokenData,
        balance,
      });
    } catch (error: any) {
      console.error("Error loading token:", error);
      setError("Error al cargar el token");
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

  // Obtener los destinatarios permitidos según el rol actual
  const getAllowedRecipients = () => {
    if (!user) return [];

    const roleHierarchy: { [key: string]: string[] } = {
      Producer: ["Factory"],
      Factory: ["Retailer"],
      Retailer: ["Consumer"],
      Consumer: [],
    };

    return roleHierarchy[user.role] || [];
  };

  const allowedRecipients = getAllowedRecipients();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.to.trim()) {
      setError("La dirección del destinatario es requerida");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(formData.to)) {
      setError("Dirección de Ethereum inválida");
      return;
    }

    const amount = parseInt(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("La cantidad debe ser un número mayor a 0");
      return;
    }

    if (!token || amount > token.balance) {
      setError(`No tienes suficiente balance. Tienes ${token?.balance || 0} unidades`);
      return;
    }

    try {
      setTransferring(true);

      await web3Service.transfer(formData.to, tokenId, amount);

      setSuccess("Transferencia iniciada exitosamente! El destinatario debe aceptarla.");

      // Limpiar formulario
      setFormData({
        to: "",
        amount: "",
      });

      // Recargar token
      await loadToken();

      // Redirigir después de 3 segundos
      setTimeout(() => {
        router.push("/transfers");
      }, 3000);

    } catch (error: any) {
      console.error("Error transferring token:", error);
      if (error.message?.includes("Invalid transfer")) {
        setError("Transferencia no permitida. Verifica que puedas transferir a este usuario según tu rol.");
      } else {
        setError(error.message || error.reason || "Error al realizar la transferencia");
      }
    } finally {
      setTransferring(false);
    }
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
          <div className="text-gray-600">Cargando token...</div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold mb-4">Token no encontrado</h1>
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
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔄</div>
            <h1 className="text-3xl font-bold mb-2">Transferir Token</h1>
            <p className="text-gray-600">
              {token.name} (ID: #{token.id})
            </p>
          </div>

          {/* Token Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Tu Balance Actual</div>
                <div className="text-3xl font-bold text-blue-600">
                  {token.balance.toLocaleString()} unidades
                </div>
              </div>
              <div className="text-5xl">📦</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Supply Total:</span>
                <span className="ml-2 font-medium">{token.totalSupply.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Parent ID:</span>
                <span className="ml-2 font-medium">
                  {token.parentId === 0 ? "Original" : `#${token.parentId}`}
                </span>
              </div>
            </div>
          </div>

          {/* Transfer Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient Address */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Dirección del Destinatario *
                </label>
                {allowedRecipients.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setUseQuickSelect(!useQuickSelect)}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    {useQuickSelect ? "✏️ Ingresar manualmente" : "📋 Selección rápida"}
                  </button>
                )}
              </div>

              {useQuickSelect && allowedRecipients.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={transferring}
                  >
                    <option value="">Selecciona un destinatario...</option>
                    {allowedRecipients.map((role) => (
                      <option
                        key={role}
                        value={knownAddresses[role as keyof typeof knownAddresses]}
                      >
                        {getRoleIcon(role)} {role} - {knownAddresses[role as keyof typeof knownAddresses].slice(0, 10)}...
                      </option>
                    ))}
                  </select>
                  {formData.to && (
                    <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs break-all text-gray-700">
                      {formData.to}
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  placeholder="0x..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  disabled={transferring}
                />
              )}

              <div className="mt-1 text-xs text-gray-500">
                {allowedRecipients.length > 0 ? (
                  <span>
                    Como <strong>{user?.role}</strong>, puedes transferir a: {allowedRecipients.join(", ")}
                  </span>
                ) : (
                  <span>Tu rol no puede realizar transferencias</span>
                )}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad a Transferir *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="100"
                min="1"
                max={token.balance}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={transferring}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Cantidad de unidades a transferir</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, amount: token.balance.toString() })}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  disabled={transferring}
                >
                  Máximo: {token.balance}
                </button>
              </div>
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
                disabled={transferring || token.balance === 0}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {transferring ? "Transfiriendo..." : "Transferir"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/tokens")}
                disabled={transferring}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Importante</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Producer solo puede transferir a Factory</li>
              <li>• Factory solo puede transferir a Retailer</li>
              <li>• Retailer solo puede transferir a Consumer</li>
              <li>• Consumer no puede transferir tokens</li>
              <li>• El destinatario debe aceptar la transferencia</li>
              <li>• Los tokens quedarán en estado pendiente hasta la aceptación</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
