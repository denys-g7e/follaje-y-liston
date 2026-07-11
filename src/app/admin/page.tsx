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
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <a href="/" className="font-display text-2xl text-charcoal tracking-wide mb-6 inline-block">
            Follaje <span className="text-rose">&</span>{" "}
            <span className="text-sage">Listón</span>
          </a>
          <div className="w-12 h-0.5 bg-gradient-to-r from-rose via-gold to-sage mx-auto my-4" />
          <h1 className="font-display text-3xl text-charcoal mt-4">
            {step === "signIn" ? "Bienvenido" : "Crear cuenta"}
          </h1>
          <p className="text-stone/50 text-sm mt-1">Panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-sm border border-stone/5 p-8 space-y-5">
          <div>
            <label className="block text-xs tracking-widest uppercase text-stone/60 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-ivory-alt border-0 border-b-2 border-stone/10 px-0 py-3 text-charcoal focus:outline-none focus:border-rose transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-stone/60 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-ivory-alt border-0 border-b-2 border-stone/10 px-0 py-3 text-charcoal focus:outline-none focus:border-rose transition-colors"
            />
          </div>

          {error && (
            <p className="text-rose text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose text-white px-8 py-3 text-sm tracking-wider uppercase font-medium hover:bg-rose-dark transition-all hover:shadow-lg hover:shadow-rose/25 disabled:opacity-50 rounded-sm"
          >
            {loading ? "Cargando..." : step === "signIn" ? "Entrar" : "Crear cuenta"}
          </button>

          <button
            type="button"
            onClick={() => { setStep(step === "signIn" ? "signUp" : "signIn"); setError(""); }}
            className="w-full text-center text-xs text-stone/40 hover:text-rose transition-colors tracking-wider uppercase"
          >
            {step === "signIn" ? "Crear nueva cuenta" : "Ya tengo cuenta"}
          </button>
        </form>

        <a href="/" className="block text-center text-xs text-stone/30 hover:text-rose mt-6 transition-colors">
          &larr; Volver al inicio
        </a>
      </div>
    </div>
  );
}
