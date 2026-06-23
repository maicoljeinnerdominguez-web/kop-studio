'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, Phone, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { useAuthDialogStore } from '@/stores/useAuthDialogStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigationStore } from '@/stores/useNavigationStore';

export default function UserAuthDialog() {
  const { isOpen, initialTab, close } = useAuthDialogStore();
  const { isAuthenticated, user, isAdmin, login, register, logout } = useAuthStore();
  const navigate = useNavigationStore((s) => s.navigate);

  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close();
      setError("");
    }
  };

  const handleTabChange = (newTab: "login" | "register") => {
    setTab(newTab);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!loginEmail || !loginPassword) {
      setError("Completa todos los campos");
      setLoading(false);
      return;
    }

    const result = await login(loginEmail, loginPassword);
    if (result.success) {
      close();
      setLoginEmail("");
      setLoginPassword("");
    } else {
      setError(result.error || "Credenciales inválidas");
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      setError("Completa todos los campos obligatorios");
      return;
    }

    if (regName.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    if (regPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const result = await register(regName, regEmail, regPassword, regPhone || undefined);
    if (result.success) {
      close();
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirmPassword("");
      setRegPhone("");
    } else {
      setError(result.error || "Error al registrarse");
    }
    setLoading(false);
  };

  // If user is logged in, show profile menu instead of auth form
  if (isAuthenticated && user) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md bg-[#0a0a0a] border border-[#1a1a1a] p-0 rounded-none">
          {/* Red accent bar */}
          <div className="h-1 bg-gradient-to-r from-red-600 to-red-800 w-full" />

          <div className="p-6">
            {/* Close button */}
            <button
              onClick={close}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
            >
              <X className="size-5" />
            </button>

            {/* User Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-600/50 flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-red-500">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">{user.name}</h3>
              <p className="text-sm text-neutral-500">{user.email}</p>
              {isAdmin && (
                <span className="mt-2 text-[10px] uppercase tracking-widest font-bold bg-red-600/20 text-red-500 px-3 py-1 border border-red-600/30">
                  Administrador
                </span>
              )}
            </div>

            {/* Menu Options */}
            <div className="space-y-1 mb-6">
              <button
                onClick={() => {
                  close();
                  navigate("order-history");
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors rounded-md"
              >
                <span>Mis Pedidos</span>
                <ArrowRight className="size-4 text-neutral-600" />
              </button>
              <button
                onClick={() => {
                  close();
                  navigate("wishlist");
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors rounded-md"
              >
                <span>Mis Favoritos</span>
                <ArrowRight className="size-4 text-neutral-600" />
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    close();
                    navigate("admin-dashboard");
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors rounded-md"
                >
                  <span>Panel de Administración</span>
                  <ArrowRight className="size-4 text-neutral-600" />
                </button>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                logout();
                close();
              }}
              className="w-full h-11 border border-red-600/30 text-red-500 hover:bg-red-600 hover:text-white text-xs uppercase tracking-widest font-bold transition-all duration-300 rounded-none"
            >
              Cerrar Sesión
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0a0a0a] border border-[#1a1a1a] p-0 rounded-none overflow-hidden">
        {/* Red accent bar */}
        <div className="h-1 bg-gradient-to-r from-red-600 to-red-800 w-full" />

        <div className="p-6">
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors z-10"
          >
            <X className="size-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-red-600/20 border border-red-600/30 rounded-full flex items-center justify-center">
              <User className="size-5 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wider uppercase">
              {tab === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </h2>
            <div className="h-0.5 w-8 bg-red-600 mx-auto mt-2" />
          </div>

          {/* Tab Switcher */}
          <div className="flex border border-[#1a1a1a] mb-6 rounded-none overflow-hidden">
            <button
              onClick={() => handleTabChange("login")}
              className={`flex-1 py-2.5 text-xs uppercase tracking-widest font-bold transition-all duration-300 ${
                tab === "login"
                  ? "bg-white text-black"
                  : "bg-transparent text-neutral-500 hover:text-white"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => handleTabChange("register")}
              className={`flex-1 py-2.5 text-xs uppercase tracking-widest font-bold transition-all duration-300 ${
                tab === "register"
                  ? "bg-white text-black"
                  : "bg-transparent text-neutral-500 hover:text-white"
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 px-4 py-3 bg-red-600/10 border border-red-600/30 text-red-400 text-sm rounded-none"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full h-12 bg-[#111] border border-[#1a1a1a] pl-10 pr-4 text-white text-sm placeholder:text-neutral-600 focus:border-white/30 focus:outline-none transition-colors"
                    autoComplete="email"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full h-12 bg-[#111] border border-[#1a1a1a] pl-10 pr-12 text-white text-sm placeholder:text-neutral-600 focus:border-white/30 focus:outline-none transition-colors"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                  >
                    {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Ingresar
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-neutral-600 mt-4">
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabChange("register")}
                    className="text-red-500 hover:text-red-400 transition-colors font-medium"
                  >
                    Regístrate aquí
                  </button>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleRegister}
                className="space-y-3"
              >
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Nombre completo *"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full h-12 bg-[#111] border border-[#1a1a1a] pl-10 pr-4 text-white text-sm placeholder:text-neutral-600 focus:border-white/30 focus:outline-none transition-colors"
                    autoComplete="name"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                  <input
                    type="email"
                    placeholder="Correo electrónico *"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full h-12 bg-[#111] border border-[#1a1a1a] pl-10 pr-4 text-white text-sm placeholder:text-neutral-600 focus:border-white/30 focus:outline-none transition-colors"
                    autoComplete="email"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                  <input
                    type="tel"
                    placeholder="Teléfono (opcional)"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full h-12 bg-[#111] border border-[#1a1a1a] pl-10 pr-4 text-white text-sm placeholder:text-neutral-600 focus:border-white/30 focus:outline-none transition-colors"
                    autoComplete="tel"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                  <input
                    type={showRegPassword ? "text" : "password"}
                    placeholder="Contraseña * (mín. 6 caracteres)"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full h-12 bg-[#111] border border-[#1a1a1a] pl-10 pr-12 text-white text-sm placeholder:text-neutral-600 focus:border-white/30 focus:outline-none transition-colors"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                  >
                    {showRegPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                  <input
                    type="password"
                    placeholder="Confirmar contraseña *"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full h-12 bg-[#111] border border-[#1a1a1a] pl-10 pr-4 text-white text-sm placeholder:text-neutral-600 focus:border-white/30 focus:outline-none transition-colors"
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Crear Cuenta
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-neutral-600 mt-3">
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabChange("login")}
                    className="text-red-500 hover:text-red-400 transition-colors font-medium"
                  >
                    Inicia sesión
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#1a1a1a]" />
            <span className="text-[10px] text-neutral-600 uppercase tracking-widest">o</span>
            <div className="flex-1 h-px bg-[#1a1a1a]" />
          </div>

          {/* Order Tracking Link */}
          <button
            onClick={() => {
              close();
              navigate("order-tracking");
            }}
            className="w-full h-11 border border-[#333] text-neutral-400 hover:text-white hover:border-white/30 text-xs uppercase tracking-widest font-medium transition-all duration-300 flex items-center justify-center gap-2"
          >
            Rastrear un pedido sin cuenta
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}