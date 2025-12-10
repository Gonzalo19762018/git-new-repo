"use client";

import { useEffect, useState } from "react";

export default function AccountChangeNotification() {
  const [notification, setNotification] = useState<{
    show: boolean;
    newAccount: string;
    oldAccount: string;
  }>({ show: false, newAccount: "", oldAccount: "" });

  useEffect(() => {
    const handleAccountChange = (event: CustomEvent) => {
      const { newAccount, oldAccount } = event.detail;
      setNotification({ show: true, newAccount, oldAccount });

      // Auto-ocultar después de 5 segundos
      setTimeout(() => {
        setNotification({ show: false, newAccount: "", oldAccount: "" });
      }, 5000);
    };

    window.addEventListener("account-changed" as any, handleAccountChange);

    return () => {
      window.removeEventListener("account-changed" as any, handleAccountChange);
    };
  }, []);

  if (!notification.show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl shadow-2xl max-w-md">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">🔄</div>
          <div className="flex-1">
            <div className="font-bold mb-1">Cuenta Cambiada</div>
            <div className="text-sm opacity-90 mb-2">
              La aplicación se ha actualizado automáticamente
            </div>
            <div className="text-xs space-y-1 bg-white/10 p-2 rounded">
              <div className="opacity-70">
                Anterior: {notification.oldAccount?.slice(0, 6)}...
                {notification.oldAccount?.slice(-4)}
              </div>
              <div className="font-semibold">
                Nueva: {notification.newAccount?.slice(0, 6)}...
                {notification.newAccount?.slice(-4)}
              </div>
            </div>
          </div>
          <button
            onClick={() =>
              setNotification({ show: false, newAccount: "", oldAccount: "" })
            }
            className="text-white/70 hover:text-white text-xl"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
