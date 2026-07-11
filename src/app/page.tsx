"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "521234567890";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

const CATEGORIES = [
  { value: "todas", label: "Todas" },
  { value: "Bodas", label: "Bodas" },
  { value: "Cumpleaños", label: "Cumpleaños" },
  { value: "Baby Shower", label: "Baby Shower" },
  { value: "Quince Años", label: "Quince Años" },
  { value: "Corporativo", label: "Corporativo" },
];

export default function Home() {
  const combos = useQuery(api.combos.list);
  const createBooking = useMutation(api.bookings.create);
  const seedCombos = useMutation(api.seed.seedCombos);

  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [showForm, setShowForm] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    comboId: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    seedCombos();
  }, [seedCombos]);

  const filtered = selectedCategory === "todas"
    ? combos
    : combos?.filter((c) => c.category === selectedCategory);

  const handleComboSelect = (comboId: string) => {
    setSelectedCombo(comboId);
    setFormData((prev) => ({ ...prev, comboId }));
    setShowForm(true);
    window.scrollTo({ top: document.getElementById("booking-form")?.offsetTop! - 100, behavior: "smooth" });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "El nombre es obligatorio";
    if (!formData.phone.trim()) errs.phone = "El teléfono es obligatorio";
    else if (!/^[\d\s+\-()]{7,15}$/.test(formData.phone)) errs.phone = "Teléfono inválido";
    if (!formData.date) errs.date = "La fecha es obligatoria";
    if (!formData.comboId) errs.comboId = "Selecciona un combo";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    await createBooking({
      name: formData.name,
      phone: formData.phone,
      date: formData.date,
      comboId: formData.comboId as any,
      notes: formData.notes || undefined,
    });

    const combo = combos?.find((c) => c._id === formData.comboId);
    const message = `¡Hola! Soy ${formData.name}. Acabo de agendar una cita en Follaje & Listón para el ${formData.date}.${combo ? ` Combo: ${combo.name}.` : ""} ¿Podemos confirmar los detalles?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");

    setSubmitted(true);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-fondo/90 backdrop-blur-sm border-b border-dorado/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
          <a href="#" className="font-display text-xl sm:text-2xl text-dorado tracking-wider">
            Follaje <span className="text-crema/60">&</span> Listón
          </a>
          <nav className="hidden sm:flex items-center gap-8 text-sm tracking-widest uppercase">
            <a href="#combos" className="text-crema/70 hover:text-dorado transition-colors">Combos</a>
            <a href="#contacto" className="text-crema/70 hover:text-dorado transition-colors">Contacto</a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-dorado/40 text-dorado px-5 py-2 hover:bg-dorado/10 transition-colors"
            >
              Agendar
            </a>
          </nav>
          <button
            className="sm:hidden text-crema"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="sm:hidden bg-superficie border-b border-dorado/20 px-4 py-4">
            <nav className="flex flex-col gap-4 text-sm tracking-widest uppercase">
              <a href="#combos" className="text-crema/70 hover:text-dorado transition-colors" onClick={() => setMobileMenuOpen(false)}>Combos</a>
              <a href="#contacto" className="text-crema/70 hover:text-dorado transition-colors" onClick={() => setMobileMenuOpen(false)}>Contacto</a>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-dorado/40 text-dorado px-5 py-2 text-center hover:bg-dorado/10 transition-colors"
              >
                Agendar
              </a>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 pt-24 pb-16 sm:pb-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-12 h-px bg-dorado mx-auto mb-8" />
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl text-dorado leading-none tracking-wide">
              Follaje & Listón
            </h1>
            <p className="font-display text-xl sm:text-2xl md:text-3xl text-crema/60 italic mt-4 sm:mt-6 font-light">
              Decoración boutique para momentos inolvidables
            </p>
            <div className="w-12 h-px bg-dorado mx-auto mt-8 mb-10" />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#combos"
                className="inline-block border border-dorado bg-dorado/10 text-dorado px-8 py-3 text-sm tracking-widest uppercase hover:bg-dorado/20 transition-colors"
              >
                Ver Combos
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-crema/30 text-crema px-8 py-3 text-sm tracking-widest uppercase hover:bg-crema/5 transition-colors"
              >
                Agendar Cita
              </a>
            </div>
          </div>
        </section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-dorado/40 to-transparent" />

        <section id="combos" className="py-16 sm:py-24 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <p className="text-dorado text-xs tracking-[0.3em] uppercase mb-4">Nuestros</p>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-dorado">Combos</h2>
              <div className="w-8 h-px bg-dorado mx-auto mt-6" />
            </div>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12 sm:mb-16">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 text-xs tracking-widest uppercase border transition-colors ${
                    selectedCategory === cat.value
                      ? "border-dorado text-dorado bg-dorado/10"
                      : "border-crema/20 text-crema/60 hover:border-crema/40 hover:text-crema"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-dorado/20">
              {filtered?.map((combo) => (
                <div
                  key={combo._id}
                  className="bg-superficie p-6 sm:p-8 flex flex-col group hover:bg-[#1a2a20] transition-colors"
                >
                  <div className="w-full aspect-[4/3] bg-fondo/50 flex items-center justify-center mb-5 border border-dorado/10">
                    <div className="text-dorado/30">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-dorado text-[10px] tracking-[0.2em] uppercase mb-2">{combo.category}</p>
                  <h3 className="font-display text-2xl text-crema mb-2">{combo.name}</h3>
                  <p className="text-dorado font-display text-xl mb-3">{combo.price}</p>
                  <p className="text-crema/60 text-sm leading-relaxed mb-6 flex-1">{combo.description}</p>
                  <button
                    onClick={() => handleComboSelect(combo._id)}
                    className="text-xs tracking-widest uppercase text-dorado border-b border-dorado/30 pb-1 self-start hover:text-dorado-claro hover:border-dorado-claro transition-colors"
                  >
                    Elegir para mi evento
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-dorado/40 to-transparent" />

        <section id="booking-form" className="py-16 sm:py-24 px-4 sm:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-dorado text-xs tracking-[0.3em] uppercase mb-4">Agenda tu</p>
              <h2 className="font-display text-4xl sm:text-5xl text-dorado">Cita</h2>
              <div className="w-8 h-px bg-dorado mx-auto mt-6" />
              <p className="text-crema/60 text-sm mt-4 max-w-md mx-auto">
                Cuéntanos sobre tu evento y nos pondremos en contacto contigo.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-12 border border-dorado/20 px-6">
                <div className="text-dorado text-4xl mb-4">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto">
                    <path d="M22 11.08V12a10 10 0 1 1 -5.93 -9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <p className="font-display text-2xl text-crema mb-2">¡Cita agendada!</p>
                <p className="text-crema/60 text-sm">Te redirigimos a WhatsApp para confirmar los detalles.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-crema/70 mb-2">Nombre completo</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full bg-transparent border border-crema/20 px-4 py-3 text-crema focus:outline-none focus:border-dorado transition-colors"
                  />
                  {errors.name && <p className="text-rosa text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-crema/70 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+52 555 123 4567"
                    className="w-full bg-transparent border border-crema/20 px-4 py-3 text-crema focus:outline-none focus:border-dorado transition-colors"
                  />
                  {errors.phone && <p className="text-rosa text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-crema/70 mb-2">Fecha del evento</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                    className="w-full bg-transparent border border-crema/20 px-4 py-3 text-crema focus:outline-none focus:border-dorado transition-colors [color-scheme:dark]"
                  />
                  {errors.date && <p className="text-rosa text-xs mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-crema/70 mb-2">Combo</label>
                  <select
                    value={formData.comboId}
                    onChange={(e) => setFormData((p) => ({ ...p, comboId: e.target.value }))}
                    className="w-full bg-superficie border border-crema/20 px-4 py-3 text-crema focus:outline-none focus:border-dorado transition-colors"
                  >
                    <option value="" className="bg-superficie">Selecciona un combo</option>
                    {combos?.map((combo) => (
                      <option key={combo._id} value={combo._id} className="bg-superficie">
                        {combo.name} — {combo.price}
                      </option>
                    ))}
                  </select>
                  {errors.comboId && <p className="text-rosa text-xs mt-1">{errors.comboId}</p>}
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-crema/70 mb-2">Notas (opcional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                    rows={3}
                    className="w-full bg-transparent border border-crema/20 px-4 py-3 text-crema focus:outline-none focus:border-dorado transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full border border-dorado bg-dorado/10 text-dorado px-8 py-3 text-sm tracking-widest uppercase hover:bg-dorado/20 transition-colors"
                >
                  Agendar cita
                </button>
              </form>
            )}
          </div>
        </section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-dorado/40 to-transparent" />

        <section id="contacto" className="py-16 sm:py-24 px-4 sm:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-dorado text-xs tracking-[0.3em] uppercase mb-4">Contáctanos</p>
              <h2 className="font-display text-4xl sm:text-5xl text-dorado">Contacto</h2>
              <div className="w-8 h-px bg-dorado mx-auto mt-6" />
            </div>
            <div className="grid sm:grid-cols-3 gap-px bg-dorado/20">
              <div className="bg-superficie p-8 sm:p-10 text-center">
                <div className="text-dorado/50 mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
                    <path d="M22 16.92v3a2 2 0 0 1 -2.18 2a19.79 19.79 0 0 1 -8.63 -3.07a19.5 19.5 0 0 1 -6 -6a19.79 19.79 0 0 1 -3.07 -8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72a12.84 12.84 0 0 0 .7 2.81a2 2 0 0 1 -.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27 -1.27a2 2 0 0 1 2.11 -.45a12.84 12.84 0 0 0 2.81 .7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <p className="text-xs tracking-widest uppercase text-crema/50 mb-2">WhatsApp</p>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dorado hover:text-dorado-claro transition-colors"
                >
                  {WHATSAPP_NUMBER}
                </a>
              </div>
              <div className="bg-superficie p-8 sm:p-10 text-center">
                <div className="text-dorado/50 mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
                    <path d="M22 16.92v3a2 2 0 0 1 -2.18 2a19.79 19.79 0 0 1 -8.63 -3.07a19.5 19.5 0 0 1 -6 -6a19.79 19.79 0 0 1 -3.07 -8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72a12.84 12.84 0 0 0 .7 2.81a2 2 0 0 1 -.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27 -1.27a2 2 0 0 1 2.11 -.45a12.84 12.84 0 0 0 2.81 .7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <p className="text-xs tracking-widest uppercase text-crema/50 mb-2">Teléfono</p>
                <p className="text-crema/80">+52 555 123 4567</p>
              </div>
              <div className="bg-superficie p-8 sm:p-10 text-center">
                <div className="text-dorado/50 mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
                    <path d="M21 10c0 7 -9 13 -9 13s-9 -6 -9 -13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <p className="text-xs tracking-widest uppercase text-crema/50 mb-2">Cobertura</p>
                <p className="text-crema/80">Ciudad de México y Área Metropolitana</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-dorado/10 py-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-display text-dorado/60 text-sm">
            Follaje & Listón &copy; {new Date().getFullYear()}
          </p>
          <a
            href="/admin"
            className="text-xs text-crema/30 hover:text-crema/60 tracking-wider uppercase transition-colors"
          >
            Acceso privado
          </a>
        </div>
      </footer>
    </>
  );
}
