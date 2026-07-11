"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export default function AdminLogin() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("flow", step);

      if (step === "signUp") {
        await signIn("password", formData);
        setSuccess("¡Cuenta creada con éxito! Iniciando sesión...");
        setTimeout(() => {
          window.location.href = "/admin/dashboard";
        }, 1500);
      } else {
        await signIn("password", formData);
      }
    } catch (err: any) {
      const message = err?.message || "";
      if (message.includes("already exists")) {
        setError("Ya existe una cuenta con ese email. Inicia sesión.");
      } else if (message.includes("Invalid")) {
        setError("Email o contraseña incorrectos.");
      } else {
        setError(message || "Error al procesar la solicitud. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose/5 via-ivory to-sage/5 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <a href="/" className="font-display text-3xl text-charcoal tracking-wide inline-block hover:opacity-80 transition-opacity">
            Follaje <span className="text-rose">&</span>{" "}
            <span className="text-sage">Listón</span>
          </a>
          <div className="w-16 h-0.5 bg-gradient-to-r from-rose via-gold to-sage mx-auto my-5" />
          <h1 className="font-display text-4xl text-charcoal">
            {step === "signIn" ? "Bienvenido" : "Crear Cuenta"}
          </h1>
          <p className="text-stone/50 text-sm mt-1.5">
            {step === "signIn" ? "Accede al panel de administración" : "Regístrate para administrar tu negocio"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-rose/5 border border-rose/10 p-8 sm:p-10 space-y-5">
          <div>
            <label className="block text-xs tracking-widest uppercase text-stone/50 mb-2 font-medium">Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full bg-ivory/80 border border-stone/20 rounded-xl px-4 py-3.5 text-charcoal focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/10 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-stone/50 mb-2 font-medium">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full bg-ivory/80 border border-stone/20 rounded-xl px-4 py-3.5 text-charcoal focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/10 transition-all text-sm"
            />
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-rose/5 border border-rose/20 rounded-xl px-4 py-3">
              <svg className="w-5 h-5 text-rose shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p className="text-rose text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <svg className="w-5 h-5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="text-emerald-700 text-sm">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-charcoal text-white rounded-xl px-8 py-3.5 text-sm tracking-wider uppercase font-medium hover:bg-rose transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {step === "signIn" ? "Iniciando sesión..." : "Creando cuenta..."}
              </>
            ) : (
              step === "signIn" ? "Iniciar Sesión" : "Crear Cuenta"
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone/10" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-stone/40">O</span></div>
          </div>

          <button
            type="button"
            onClick={() => {
              setStep(step === "signIn" ? "signUp" : "signIn");
              setError("");
              setSuccess("");
            }}
            className="w-full text-center text-sm text-stone/40 hover:text-rose transition-colors"
          >
            {step === "signIn" ? "¿No tienes cuenta? Crear una nueva" : "¿Ya tienes cuenta? Iniciar sesión"}
          </button>
        </form>

        <a href="/" className="block text-center text-sm text-stone/30 hover:text-rose/60 mt-6 transition-colors">
          <svg className="w-4 h-4 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
