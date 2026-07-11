"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "521234567890";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

const CATEGORIES = [
  { value: "todas", label: "Todo" },
  { value: "Bodas", label: "Bodas" },
  { value: "Cumpleaños", label: "Cumpleaños" },
  { value: "Baby Shower", label: "Baby Shower" },
  { value: "Quince Años", label: "Quince Años" },
  { value: "Corporativo", label: "Corporativo" },
];

function Flower({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
      <circle cx="50" cy="30" r="12" />
      <circle cx="32" cy="45" r="10" />
      <circle cx="68" cy="45" r="10" />
      <circle cx="38" cy="65" r="9" />
      <circle cx="62" cy="65" r="9" />
      <circle cx="50" cy="50" r="6" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M50 90 C30 70 20 45 30 25 C40 5 60 5 70 25 C80 45 70 70 50 90Z" />
      <path d="M50 90 L50 30" />
      <path d="M35 40 Q50 35 65 40" />
      <path d="M30 55 Q50 48 70 55" />
    </svg>
  );
}

export default function Home() {
  const combos = useQuery(api.combos.list);
  const createBooking = useMutation(api.bookings.create);
  const seedCombos = useMutation(api.seed.seedCombos);

  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "", phone: "", date: "", comboId: "", notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    seedCombos();
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [seedCombos]);

  const filtered = selectedCategory === "todas"
    ? combos
    : combos?.filter((c) => c.category === selectedCategory);

  const handleComboSelect = (comboId: string) => {
    setSelectedCombo(comboId);
    setFormData((prev) => ({ ...prev, comboId }));
    window.scrollTo({ top: document.getElementById("booking-form")?.offsetTop! - 120, behavior: "smooth" });
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
      name: formData.name, phone: formData.phone, date: formData.date,
      comboId: formData.comboId as any, notes: formData.notes || undefined,
    });

    const combo = combos?.find((c) => c._id === formData.comboId);
    const message = `¡Hola! Soy ${formData.name}. Acabo de agendar una cita en Follaje & Listón para el ${formData.date}.${combo ? ` Combo: ${combo.name}.` : ""} ¿Podemos confirmar los detalles?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
    setSubmitted(true);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm shadow-rose/5" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <a href="#" className={`font-display text-2xl lg:text-3xl tracking-wide transition-colors ${
            scrolled ? "text-charcoal" : "text-white"
          }`}>
            Follaje <span className="text-rose">&</span>{" "}
            <span className="text-sage">Listón</span>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#combos" className={`text-sm tracking-wider uppercase font-medium transition-colors hover:text-rose ${
              scrolled ? "text-stone" : "text-white/80"
            }`}>Paquetes</a>
            <a href="#contacto" className={`text-sm tracking-wider uppercase font-medium transition-colors hover:text-rose ${
              scrolled ? "text-stone" : "text-white/80"
            }`}>Contacto</a>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
              className="bg-rose text-white px-6 py-2.5 text-sm tracking-wider uppercase font-medium hover:bg-rose-dark transition-all hover:shadow-lg hover:shadow-rose/30 rounded-full">
            Agendar
            </a>
          </nav>
          <button className={`md:hidden transition-colors ${scrolled ? "text-charcoal" : "text-white"}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileMenuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-rose/10 px-6 py-5">
            <nav className="flex flex-col gap-4">
              <a href="#combos" className="text-stone hover:text-rose text-sm tracking-wider uppercase font-medium" onClick={() => setMobileMenuOpen(false)}>Paquetes</a>
              <a href="#contacto" className="text-stone hover:text-rose text-sm tracking-wider uppercase font-medium" onClick={() => setMobileMenuOpen(false)}>Contacto</a>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="bg-rose text-white px-5 py-2.5 text-sm tracking-wider uppercase font-medium text-center rounded-full">Agendar</a>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-charcoal via-[#1a1a2e] to-[#16213e]">
          <div className="absolute inset-0 opacity-[0.08]">
            <Flower className="absolute top-20 right-10 w-48 h-48 text-rose" />
            <Leaf className="absolute bottom-20 left-10 w-56 h-56 text-sage" />
            <Flower className="absolute top-1/2 left-1/4 w-32 h-32 text-gold" />
            <Leaf className="absolute bottom-1/3 right-1/4 w-36 h-36 text-rose" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ivory/5 via-transparent to-black/20" />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 w-full pt-24 pb-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-3 mb-6">
                <span className="w-8 h-px bg-rose/50" />
                <span className="text-rose/80 text-xs tracking-[0.3em] uppercase font-medium">Decoración Boutique</span>
                <span className="w-8 h-px bg-rose/50" />
              </div>
              <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-white leading-[0.92] mb-6">
                Donde tus sueños
                <br />
                <span className="bg-gradient-to-r from-rose via-gold to-sage bg-clip-text text-transparent">
                  florecen
                </span>
                <br />
                en cada detalle
              </h1>
              <p className="text-white/50 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                Transformamos tus momentos especiales en experiencias inolvidables con diseños
                únicos y personalizados para cada celebración.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#combos"
                  className="group bg-rose text-white px-8 py-3.5 text-sm tracking-wider uppercase font-medium hover:bg-rose-dark transition-all duration-300 inline-flex items-center justify-center gap-2 rounded-full hover:shadow-xl hover:shadow-rose/25">
                  Ver Paquetes
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
                  className="group border-2 border-white/20 text-white px-8 py-3.5 text-sm tracking-wider uppercase font-medium hover:border-rose hover:text-rose transition-all duration-300 inline-flex items-center justify-center gap-2 rounded-full">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6" />
                  </svg>
                  Conversemos
                </a>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ivory to-transparent" />
        </section>

        <section id="combos" className="py-24 lg:py-32 px-6 lg:px-10 bg-ivory">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-rose text-xs tracking-[0.3em] uppercase font-medium">Nuestros</span>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-charcoal mt-3 mb-5">Paquetes</h2>
              <div className="w-20 h-0.5 bg-gradient-to-r from-rose via-gold to-sage mx-auto rounded-full" />
              <p className="text-stone/50 mt-5 max-w-lg mx-auto">
                Cada paquete incluye montaje, desmontaje y asesoría personalizada sin costo extra.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-16">
              {CATEGORIES.map((cat) => (
                <button key={cat.value} onClick={() => setSelectedCategory(cat.value)}
                  className={`px-5 py-2.5 text-xs tracking-widest uppercase font-medium rounded-full transition-all duration-300 ${
                    selectedCategory === cat.value
                      ? "bg-charcoal text-white shadow-lg"
                      : "bg-white text-stone border border-stone/10 hover:border-rose hover:text-rose shadow-sm"
                  }`}>
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered?.map((combo) => (
                <div key={combo._id}
                  className="group bg-white rounded-2xl overflow-hidden border border-stone/5 shadow-sm hover:shadow-xl hover:shadow-rose/5 transition-all duration-500">
                  <div className="relative h-56 bg-gradient-to-br from-rose/5 via-ivory to-sage/5 flex items-center justify-center overflow-hidden">
                    <Flower className="w-24 h-24 text-rose/10 group-hover:scale-110 group-hover:text-rose/20 transition-all duration-700" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold text-rose rounded-full shadow-sm">
                      {combo.price}
                    </div>
                  </div>
                  <div className="p-7 lg:p-8">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-4 h-px bg-rose/40" />
                      <span className="text-rose/60 text-[10px] tracking-[0.25em] uppercase font-medium">{combo.category}</span>
                    </div>
                    <h3 className="font-display text-2xl text-charcoal mb-2">{combo.name}</h3>
                    <p className="text-stone/50 text-sm leading-relaxed mb-6 line-clamp-3">{combo.description}</p>
                    <button onClick={() => handleComboSelect(combo._id)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-charcoal hover:text-rose transition-colors group/btn">
                      <span className="border-b border-charcoal/20 group-hover/btn:border-rose pb-0.5">Elegir para mi evento</span>
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-24 lg:py-28 overflow-hidden bg-gradient-to-br from-charcoal via-[#1a1a2e] to-[#16213e]">
          <div className="absolute inset-0 opacity-[0.06]">
            <Flower className="absolute top-10 right-10 w-64 h-64 text-rose" />
            <Leaf className="absolute bottom-10 left-10 w-48 h-48 text-sage" />
          </div>
          <div className="relative max-w-4xl mx-auto px-6 lg:px-10 text-center">
            <span className="text-sage/80 text-xs tracking-[0.3em] uppercase font-medium">¿Listo para tu evento?</span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mt-4 mb-6 leading-tight">
              Hagamos algo hermoso
              <br />
              <span className="bg-gradient-to-r from-rose via-gold to-sage bg-clip-text text-transparent">juntos</span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto mb-10 text-lg font-light">
              Cuéntanos tu visión y crearemos una propuesta personalizada que supere tus expectativas.
            </p>
            <a href="#booking-form"
              className="inline-flex items-center gap-2 bg-rose text-white px-8 py-3.5 text-sm tracking-wider uppercase font-medium hover:bg-rose-dark transition-all duration-300 rounded-full hover:shadow-xl hover:shadow-rose/25">
              Solicitar Cotización
            </a>
          </div>
        </section>

        <section id="booking-form" className="py-24 lg:py-32 px-6 lg:px-10 bg-ivory">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-rose text-xs tracking-[0.3em] uppercase font-medium">Agenda tu</span>
              <h2 className="font-display text-4xl sm:text-5xl text-charcoal mt-3 mb-5">Cita</h2>
              <div className="w-20 h-0.5 bg-gradient-to-r from-rose via-gold to-sage mx-auto rounded-full" />
              <p className="text-stone/50 mt-5">Déjanos tus datos y te contactaremos para confirmar todos los detalles.</p>
            </div>

            {submitted ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-stone/5 shadow-lg">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <p className="font-display text-3xl text-charcoal mb-3">¡Cita agendada!</p>
                <p className="text-stone/50">Te redirigimos a WhatsApp para ultimar detalles.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone/5 shadow-xl shadow-rose/5 p-8 sm:p-10 space-y-6">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-stone/50 mb-2 font-medium">Nombre completo</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      className="w-full bg-ivory/80 border border-stone/20 rounded-xl px-4 py-3.5 text-charcoal focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/10 transition-all text-sm" />
                    {errors.name && <p className="text-rose text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-stone/50 mb-2 font-medium">Teléfono</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+52 555 123 4567"
                      className="w-full bg-ivory/80 border border-stone/20 rounded-xl px-4 py-3.5 text-charcoal focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/10 transition-all text-sm" />
                    {errors.phone && <p className="text-rose text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone/50 mb-2 font-medium">Fecha del evento</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                    className="w-full bg-ivory/80 border border-stone/20 rounded-xl px-4 py-3.5 text-charcoal focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/10 transition-all text-sm [color-scheme:light]" />
                  {errors.date && <p className="text-rose text-xs mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone/50 mb-2 font-medium">Combo</label>
                  <select value={formData.comboId} onChange={(e) => setFormData((p) => ({ ...p, comboId: e.target.value }))}
                    className="w-full bg-ivory/80 border border-stone/20 rounded-xl px-4 py-3.5 text-charcoal focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/10 transition-all text-sm">
                    <option value="" className="bg-white">Selecciona un combo</option>
                    {combos?.map((combo) => (
                      <option key={combo._id} value={combo._id} className="bg-white">{combo.name} — {combo.price}</option>
                    ))}
                  </select>
                  {errors.comboId && <p className="text-rose text-xs mt-1">{errors.comboId}</p>}
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone/50 mb-2 font-medium">Notas (opcional)</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} rows={3}
                    className="w-full bg-ivory/80 border border-stone/20 rounded-xl px-4 py-3.5 text-charcoal focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/10 transition-all text-sm resize-none" />
                </div>
                <button type="submit"
                  className="w-full bg-charcoal text-white rounded-xl px-8 py-4 text-sm tracking-wider uppercase font-medium hover:bg-rose transition-all duration-300 hover:shadow-xl hover:shadow-rose/25">
                  Agendar Cita
                </button>
              </form>
            )}
          </div>
        </section>

        <section id="contacto" className="py-24 lg:py-32 px-6 lg:px-10 bg-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <Flower className="absolute bottom-0 right-0 w-72 h-72 text-rose" />
            <Leaf className="absolute top-0 left-0 w-48 h-48 text-sage" />
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <span className="text-gold/70 text-xs tracking-[0.3em] uppercase font-medium">Contáctanos</span>
              <h2 className="font-display text-4xl sm:text-5xl text-charcoal mt-3 mb-5">Estamos aquí para ti</h2>
              <div className="w-20 h-0.5 bg-gradient-to-r from-rose via-gold to-sage mx-auto rounded-full" />
            </div>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { icon: "whatsapp", title: "WhatsApp", value: WHATSAPP_NUMBER, href: WHATSAPP_LINK },
                { icon: "phone", title: "Teléfono", value: "+52 555 123 4567", href: null },
                { icon: "location", title: "Cobertura", value: "CDMX y Área Metropolitana", href: null },
              ].map((item, i) => (
                <div key={i} className="bg-ivory rounded-2xl p-8 sm:p-10 text-center border border-stone/5 hover:shadow-xl hover:shadow-rose/5 transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-rose/10 to-sage/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-dark">
                    {item.icon === "whatsapp" && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    )}
                    {item.icon === "phone" && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    )}
                    {item.icon === "location" && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs tracking-widest uppercase text-stone/40 mb-2 font-medium">{item.title}</p>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-charcoal font-medium hover:text-rose transition-colors text-lg">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-charcoal font-medium text-lg">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-charcoal text-white/30 py-16 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <p className="font-display text-2xl text-white/40">
              Follaje <span className="text-rose/40">&</span>{" "}
              <span className="text-sage/40">Listón</span>
            </p>
            <div className="flex items-center gap-8 text-xs tracking-wider uppercase">
              <a href="#combos" className="hover:text-white/60 transition-colors">Paquetes</a>
              <a href="#contacto" className="hover:text-white/60 transition-colors">Contacto</a>
              <a href="/admin" className="hover:text-white/60 transition-colors">Acceso privado</a>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center">
            <p className="text-xs tracking-wide">&copy; {new Date().getFullYear()} Follaje & Listón — Todos los derechos reservados</p>
          </div>
        </div>
      </footer>
    </>
  );
}
