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

function FlowerIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M12 2C12 2 8 6 8 10C8 13.3 10.7 16 12 16C13.3 16 16 13.3 16 10C16 6 12 2 12 2Z" />
      <path d="M12 22C12 22 16 18 16 14C16 10.7 13.3 8 12 8C10.7 8 8 10.7 8 14C8 18 12 22 12 22Z" />
      <path d="M5 8C5 8 8 10 11 9.5C13.5 9.1 15 7 15 7" />
      <path d="M19 8C19 8 16 10 13 9.5C10.5 9.1 9 7 9 7" />
      <path d="M5 16C5 16 8 14 11 14.5C13.5 14.9 15 17 15 17" />
      <path d="M19 16C19 16 16 14 13 14.5C10.5 14.9 9 17 9 17" />
    </svg>
  );
}

function LeafIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M12 3C12 3 7 8 6 13C5.5 15.5 7 19 12 21" />
      <path d="M12 3C12 3 17 8 18 13C18.5 15.5 17 19 12 21" />
      <path d="M8 10L16 10" />
      <path d="M6 14L18 14" />
    </svg>
  );
}

export default function Home() {
  const combos = useQuery(api.combos.list);
  const createBooking = useMutation(api.bookings.create);
  const seedCombos = useMutation(api.seed.seedCombos);

  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [showForm, setShowForm] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "", phone: "", date: "", comboId: "", notes: "",
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
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-rose-light/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <a href="#" className="font-display text-2xl lg:text-3xl text-charcoal tracking-wide">
            Follaje <span className="text-rose">&</span>{" "}
            <span className="text-sage">Listón</span>
          </a>
          <nav className="hidden md:flex items-center gap-10">
            <a href="#combos" className="text-stone hover:text-rose text-sm tracking-wider uppercase font-medium transition-colors">Combos</a>
            <a href="#contacto" className="text-stone hover:text-rose text-sm tracking-wider uppercase font-medium transition-colors">Contacto</a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-rose text-white px-6 py-2.5 text-sm tracking-wider uppercase font-medium hover:bg-rose-dark transition-all hover:shadow-lg hover:shadow-rose/25 rounded-sm"
            >
              Agendar
            </a>
          </nav>
          <button className="md:hidden text-charcoal" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileMenuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-rose-light/20 px-6 py-5">
            <nav className="flex flex-col gap-4">
              <a href="#combos" className="text-stone hover:text-rose text-sm tracking-wider uppercase font-medium" onClick={() => setMobileMenuOpen(false)}>Combos</a>
              <a href="#contacto" className="text-stone hover:text-rose text-sm tracking-wider uppercase font-medium" onClick={() => setMobileMenuOpen(false)}>Contacto</a>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="bg-rose text-white px-5 py-2.5 text-sm tracking-wider uppercase font-medium text-center rounded-sm">Agendar</a>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section className="hero-gradient min-h-screen flex items-center relative overflow-hidden pt-20">
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
            <div className="absolute top-20 left-10 text-rose"><FlowerIcon className="w-32 h-32" /></div>
            <div className="absolute bottom-20 right-10 text-sage"><LeafIcon className="w-40 h-40" /></div>
            <div className="absolute top-1/3 right-1/4 text-gold"><FlowerIcon className="w-24 h-24" /></div>
            <div className="absolute bottom-1/3 left-1/4 text-rose"><LeafIcon className="w-28 h-28" /></div>
          </div>
          <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-3 mb-8">
                <span className="w-8 h-px bg-rose/40" />
                <span className="text-rose/70 text-xs tracking-[0.25em] uppercase font-medium">Decoración Boutique</span>
                <span className="w-8 h-px bg-rose/40" />
              </div>
              <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-charcoal leading-[0.95] mb-6 tracking-tight">
                Creamos el
                <br />
                <span className="gradient-text">escenario perfecto</span>
                <br />
                para tu historia
              </h1>
              <p className="text-stone/80 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                Bodas, cumpleaños, baby showers y eventos corporativos — cada detalle cuenta,
                y nosotros nos encargamos de todos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#combos"
                  className="group bg-charcoal text-ivory px-8 py-3.5 text-sm tracking-wider uppercase font-medium hover:bg-rose transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  Ver Combos
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border-2 border-charcoal/20 text-charcoal px-8 py-3.5 text-sm tracking-wider uppercase font-medium hover:border-rose hover:text-rose transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  Hablemos
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-ivory to-transparent" />
        </section>

        <section id="combos" className="py-24 lg:py-32 px-6 lg:px-10 bg-ivory">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-rose text-xs tracking-[0.25em] uppercase font-medium">Nuestros</span>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-charcoal mt-3 mb-4">Paquetes de Decoración</h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-rose via-gold to-sage mx-auto" />
              <p className="text-stone/70 mt-5 max-w-lg mx-auto">
                Cada paquete incluye montaje, desmontaje y asesoría personalizada.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-16">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-5 py-2.5 text-xs tracking-widest uppercase font-medium rounded-full transition-all duration-300 ${
                    selectedCategory === cat.value
                      ? "bg-rose text-white shadow-md shadow-rose/20"
                      : "bg-white text-stone border border-stone/20 hover:border-rose hover:text-rose"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filtered?.map((combo) => (
                <div
                  key={combo._id}
                  className="group bg-white rounded-sm overflow-hidden border border-stone/5 card-hover"
                >
                  <div className="relative h-56 bg-gradient-to-br from-rose-light/30 via-ivory-alt to-sage-light/30 flex items-center justify-center overflow-hidden">
                    <FlowerIcon className="w-20 h-20 text-rose/20 flower-icon" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 text-sm font-medium text-rose-dark rounded-full">
                      {combo.price}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
                  </div>
                  <div className="p-6 lg:p-7">
                    <span className="text-rose-dark/60 text-[10px] tracking-[0.2em] uppercase font-medium">{combo.category}</span>
                    <h3 className="font-display text-2xl text-charcoal mt-1 mb-2">{combo.name}</h3>
                    <p className="text-stone/60 text-sm leading-relaxed mb-5 line-clamp-2">{combo.description}</p>
                    <button
                      onClick={() => handleComboSelect(combo._id)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-rose hover:text-rose-dark transition-colors group/btn"
                    >
                      Elegir para mi evento
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

        <section className="py-20 lg:py-28 bg-ivory-alt relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <FlowerIcon className="absolute top-10 right-10 w-48 h-48 text-rose" />
            <LeafIcon className="absolute bottom-10 left-10 w-36 h-36 text-sage" />
          </div>
          <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center relative z-10">
            <span className="text-sage text-xs tracking-[0.25em] uppercase font-medium">¿Listo para tu evento?</span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-charcoal mt-3 mb-6">
              Hagamos algo hermoso juntos
            </h2>
            <p className="text-stone/60 max-w-xl mx-auto mb-8">
              Cuéntanos tu visión y crearemos una propuesta personalizada para ti.
            </p>
            <a
              href="#booking-form"
              className="inline-flex items-center gap-2 bg-sage text-white px-8 py-3.5 text-sm tracking-wider uppercase font-medium hover:bg-sage-dark transition-all hover:shadow-lg hover:shadow-sage/25"
            >
              Solicitar cotización
            </a>
          </div>
        </section>

        <section id="booking-form" className="py-24 lg:py-32 px-6 lg:px-10 bg-ivory">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-rose text-xs tracking-[0.25em] uppercase font-medium">Agenda tu</span>
              <h2 className="font-display text-4xl sm:text-5xl text-charcoal mt-3 mb-4">Cita</h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-rose via-gold to-sage mx-auto" />
              <p className="text-stone/60 mt-4">Déjanos tus datos y te contactaremos para confirmar.</p>
            </div>

            {submitted ? (
              <div className="text-center py-16 bg-white border border-stone/5 rounded-sm">
                <div className="w-16 h-16 bg-sage-light/50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-sage-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <p className="font-display text-2xl text-charcoal mb-2">¡Cita agendada!</p>
                <p className="text-stone/60">Te redirigimos a WhatsApp para ultimar detalles.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border border-stone/5 rounded-sm p-8 lg:p-10 space-y-6">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-stone/60 mb-2">Nombre completo</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      className="w-full bg-ivory-alt border-0 border-b-2 border-stone/10 px-0 py-3 text-charcoal focus:outline-none focus:border-rose transition-colors" />
                    {errors.name && <p className="text-rose text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-stone/60 mb-2">Teléfono</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+52 555 123 4567"
                      className="w-full bg-ivory-alt border-0 border-b-2 border-stone/10 px-0 py-3 text-charcoal focus:outline-none focus:border-rose transition-colors" />
                    {errors.phone && <p className="text-rose text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone/60 mb-2">Fecha del evento</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                    className="w-full bg-ivory-alt border-0 border-b-2 border-stone/10 px-0 py-3 text-charcoal focus:outline-none focus:border-rose transition-colors [color-scheme:light]" />
                  {errors.date && <p className="text-rose text-xs mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone/60 mb-2">Combo</label>
                  <select value={formData.comboId} onChange={(e) => setFormData((p) => ({ ...p, comboId: e.target.value }))}
                    className="w-full bg-ivory-alt border-0 border-b-2 border-stone/10 px-0 py-3 text-charcoal focus:outline-none focus:border-rose transition-colors">
                    <option value="" className="bg-white">Selecciona un combo</option>
                    {combos?.map((combo) => (
                      <option key={combo._id} value={combo._id} className="bg-white">{combo.name} — {combo.price}</option>
                    ))}
                  </select>
                  {errors.comboId && <p className="text-rose text-xs mt-1">{errors.comboId}</p>}
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone/60 mb-2">Notas (opcional)</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} rows={3}
                    className="w-full bg-ivory-alt border-0 border-b-2 border-stone/10 px-0 py-3 text-charcoal focus:outline-none focus:border-rose transition-colors resize-none" />
                </div>
                <button type="submit"
                  className="w-full bg-rose text-white px-8 py-3.5 text-sm tracking-wider uppercase font-medium hover:bg-rose-dark transition-all hover:shadow-lg hover:shadow-rose/25 rounded-sm">
                  Agendar cita
                </button>
              </form>
            )}
          </div>
        </section>

        <section id="contacto" className="py-24 lg:py-32 px-6 lg:px-10 bg-ivory-alt relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <FlowerIcon className="absolute bottom-0 right-0 w-56 h-56 text-sage" />
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <span className="text-gold text-xs tracking-[0.25em] uppercase font-medium">Contáctanos</span>
              <h2 className="font-display text-4xl sm:text-5xl text-charcoal mt-3 mb-4">Estamos aquí para ti</h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-rose via-gold to-sage mx-auto" />
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  ),
                  title: "WhatsApp",
                  value: WHATSAPP_NUMBER,
                  href: WHATSAPP_LINK,
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  ),
                  title: "Teléfono",
                  value: "+52 555 123 4567",
                  href: null,
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  ),
                  title: "Cobertura",
                  value: "CDMX y Área Metropolitana",
                  href: null,
                },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-sm p-8 text-center card-hover border border-stone/5">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-light/30 to-sage-light/30 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-dark">
                    {item.icon}
                  </div>
                  <p className="text-xs tracking-widest uppercase text-stone/50 mb-2">{item.title}</p>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-rose font-medium hover:text-rose-dark transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-charcoal font-medium">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-charcoal text-ivory/60 py-12 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-display text-ivory/40 text-lg">
            Follaje <span className="text-rose/60">&</span>{" "}
            <span className="text-sage/60">Listón</span>
          </p>
          <p className="text-xs tracking-wide">
            &copy; {new Date().getFullYear()} — Todos los derechos reservados
          </p>
          <a
            href="/admin"
            className="text-xs text-ivory/20 hover:text-ivory/50 tracking-wider uppercase transition-colors"
          >
            Acceso privado
          </a>
        </div>
      </footer>
    </>
  );
}
