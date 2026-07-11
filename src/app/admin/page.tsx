"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export default function AdminLogin() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("flow", step);
      await signIn("password", formData);
    } catch (err: any) {
      setError(err?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-fondo">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-8 h-px bg-dorado mx-auto mb-6" />
          <h1 className="font-display text-4xl text-dorado mb-2">
            {step === "signIn" ? "Iniciar Sesión" : "Registrarse"}
          </h1>
          <p className="text-crema/50 text-sm">Panel de administración</p>
          <div className="w-8 h-px bg-dorado mx-auto mt-6" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs tracking-widest uppercase text-crema/70 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border border-crema/20 px-4 py-3 text-crema focus:outline-none focus:border-dorado transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-crema/70 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-transparent border border-crema/20 px-4 py-3 text-crema focus:outline-none focus:border-dorado transition-colors"
            />
          </div>

          {error && (
            <p className="text-rosa text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-dorado bg-dorado/10 text-dorado px-8 py-3 text-sm tracking-widest uppercase hover:bg-dorado/20 transition-colors disabled:opacity-50"
          >
            {loading ? "Cargando..." : step === "signIn" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        <button
          onClick={() => {
            setStep(step === "signIn" ? "signUp" : "signIn");
            setError("");
          }}
          className="w-full text-center text-xs text-crema/40 hover:text-crema/70 mt-6 transition-colors tracking-wider uppercase"
        >
          {step === "signIn" ? "Crear nueva cuenta" : "Ya tengo cuenta"}
        </button>

        <a
          href="/"
          className="block text-center text-xs text-crema/30 hover:text-crema/60 mt-4 transition-colors"
        >
          &larr; Volver al inicio
        </a>
      </div>
    </div>
  );
}
