"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const DEFAULT_WHATSAPP = "59177866543";
const CATEGORIES = [
  { value: "todas", label: "Todo" },
  { value: "Bodas", label: "Bodas" },
  { value: "Cumpleaños", label: "Cumpleaños" },
  { value: "Baby Shower", label: "Baby Shower" },
  { value: "Quince Años", label: "Quince Años" },
  { value: "Corporativo", label: "Corporativo" },
];

function Flower({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.8">
      <circle cx="50" cy="30" r="14" />
      <circle cx="30" cy="46" r="11" />
      <circle cx="70" cy="46" r="11" />
      <circle cx="36" cy="68" r="10" />
      <circle cx="64" cy="68" r="10" />
      <circle cx="50" cy="50" r="6" fill="currentColor" fillOpacity="0.25" />
    </svg>
  );
}

function useMouseParallax(ref: React.RefObject<HTMLDivElement | null>, strength = 20) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setOffset({ x: x * strength, y: y * strength });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [ref, strength]);
  return offset;
}

function use3DTilt(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      el.style.transform = `perspective(1000px) rotateX(${(y - 0.5) * -12}deg) rotateY(${(x - 0.5) * 12}deg) scale3d(1.02,1.02,1.02)`;
      el.style.transition = "transform 0.1s ease-out";
    };
    const handleMouseLeave = () => {
      el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
      el.style.transition = "transform 0.5s ease-out";
    };
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [ref]);
}

function MorphBlob({ className = "", color = "magenta" }: { className?: string; color?: string }) {
  const colors: Record<string, string> = {
    magenta: "rgba(232,62,107,0.2)",
    gold: "rgba(245,166,35,0.15)",
    emerald: "rgba(46,204,113,0.15)",
  };
  return (
    <div className={`absolute animate-morph ${className}`}
      style={{
        width: "500px", height: "500px",
        background: `radial-gradient(circle, ${colors[color] || colors.magenta} 0%, transparent 70%)`,
        filter: "blur(60px)",
      }}
    />
  );
}

function ComboCard({ combo, onSelect, index }: { combo: any; onSelect: (id: string) => void; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);
  const [visible, setVisible] = useState(false);

  use3DTilt(cardRef);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 100 + index * 100);
    return () => clearTimeout(timeout);
  }, [index]);

  return (
    <div
      ref={cardRef}
      className={`group bg-white rounded-3xl overflow-hidden border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-700 card-3d ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="relative h-60 overflow-hidden">
        {combo.imageUrl && !imgError ? (
          <>
            <img src={combo.imageUrl} alt={combo.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-magenta/5 via-warm to-emerald/5 flex items-center justify-center">
            <Flower className="w-28 h-28 text-magenta/10 group-hover:scale-110 group-hover:text-magenta/20 transition-all duration-700" />
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 text-sm font-bold text-magenta rounded-full shadow-lg">
          {combo.price}
        </div>
        {!combo.active && (
          <div className="absolute top-4 left-4 bg-dark/80 backdrop-blur-sm px-3 py-1.5 text-[10px] tracking-widest uppercase font-medium text-white/70 rounded-full">
            Inactivo
          </div>
        )}
      </div>
      <div className="p-7 lg:p-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-5 h-0.5 bg-gradient-to-r from-magenta to-gold rounded-full" />
          <span className="text-magenta/70 text-[10px] tracking-[0.25em] uppercase font-bold">{combo.category}</span>
        </div>
        <h3 className="font-display text-2xl text-navy mb-2 font-bold">{combo.name}</h3>
        <p className="text-stone/60 text-sm leading-relaxed mb-6 line-clamp-3">{combo.description}</p>
        <button onClick={() => onSelect(combo._id)}
          className="inline-flex items-center gap-2 text-sm font-bold text-navy hover:text-magenta transition-colors group/btn">
          <span className="border-b-2 border-navy/20 group-hover/btn:border-magenta pb-0.5">Lo quiero para mi evento</span>
          <svg className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const combos = useQuery(api.combos.list);
  const content = useQuery(api.content.getAll);
  const createBooking = useMutation(api.bookings.create);
  const seedCombos = useMutation(api.seed.seedCombos);

  const heroRef = useRef<HTMLDivElement>(null);
  const parallax = useMouseParallax(heroRef, 25);

  const [category, setCategory] = useState("todas");
  const [form, setForm] = useState({ name: "", phone: "", date: "", comboId: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => { setHeroLoaded(true); }, []);

  useEffect(() => {
    seedCombos();
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [seedCombos]);

  const t = (key: string, fallback: string) => content?.[key] ?? fallback;
  const whatsapp = t("whatsapp.number", DEFAULT_WHATSAPP);
  const whatsappLink = `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`;

  const filtered = category === "todas" ? combos : combos?.filter((c) => c.category === category);

  const pickCombo = (id: string) => {
    setForm((p) => ({ ...p, comboId: id }));
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Obligatorio";
    if (!form.phone.trim()) e.phone = "Obligatorio";
    else if (!/^[\d\s+\-()]{7,15}$/.test(form.phone)) e.phone = "Inválido";
    if (!form.date) e.date = "Obligatorio";
    if (!form.comboId) e.comboId = "Elige uno";
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    await createBooking({
      name: form.name, phone: form.phone, date: form.date,
      comboId: form.comboId as any, notes: form.notes || undefined,
    });
    const combo = combos?.find((c) => c._id === form.comboId);
    const msg = `¡Hola! Soy ${form.name} ✨ Acabo de agendar en Follaje & Listón para el ${form.date}.${combo ? ` Elegí: ${combo.name}.` : ""} ¿Confirmamos detalles?`;
    window.open(`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
    setSent(true);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-dark shadow-2xl shadow-dark/20" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <a href="#" className={`font-display text-2xl lg:text-3xl font-bold tracking-tight transition-colors ${
            scrolled ? "text-white" : "text-white"
          }`}>
            Follaje<span className="text-magenta">&</span>
            <span className="text-emerald">Listón</span>
          </a>
          <nav className="hidden md:flex items-center gap-10">
            <a href="#combos" className="text-sm tracking-widest uppercase font-semibold text-white/70 hover:text-magenta transition-colors">Paquetes</a>
            <a href="#contacto" className="text-sm tracking-widest uppercase font-semibold text-white/70 hover:text-magenta transition-colors">Contacto</a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
              className="bg-magenta text-white px-7 py-2.5 text-sm tracking-wider uppercase font-bold hover:bg-magenta-dark transition-all hover:shadow-lg hover:shadow-magenta/40 rounded-full">
              Agenda ya
            </a>
          </nav>
          <button className={`md:hidden transition-colors text-white`} onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden glass-dark px-6 py-6">
            <nav className="flex flex-col gap-5">
              <a href="#combos" className="text-white/80 hover:text-magenta text-sm tracking-widest uppercase font-semibold" onClick={() => setMenuOpen(false)}>Paquetes</a>
              <a href="#contacto" className="text-white/80 hover:text-magenta text-sm tracking-widest uppercase font-semibold" onClick={() => setMenuOpen(false)}>Contacto</a>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="bg-magenta text-white px-6 py-3 text-sm tracking-wider uppercase font-bold text-center rounded-full">Agenda ya</a>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden hero-gradient">
          <MorphBlob color="magenta" className="top-[-200px] right-[-100px]" />
          <MorphBlob color="gold" className="bottom-[-200px] left-[-100px]" />
          <MorphBlob color="emerald" className="top-1/3 left-1/4" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ transform: `translate(${parallax.x * 0.5}px, ${parallax.y * 0.5}px)` }}>
            <Flower className="absolute top-20 right-10 w-64 h-64 text-white animate-float" />
            <Flower className="absolute bottom-20 left-10 w-48 h-48 text-white animate-float-reverse" style={{ animationDelay: "2s" }} />
            <Flower className="absolute top-1/3 right-1/4 w-36 h-36 text-white animate-float" style={{ animationDelay: "4s" }} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-dark/40 via-transparent to-dark/10" />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 w-full pt-28 pb-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className={`inline-flex items-center gap-3 mb-8 ${heroLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
                <span className="w-10 h-px bg-magenta/60" />
                <span className="text-magenta/90 text-xs tracking-[0.35em] uppercase font-bold">{t("hero.tagline", "Decoración Boutique • Bolivia")}</span>
                <span className="w-10 h-px bg-magenta/60" />
              </div>
              <h1 className={`font-display text-6xl sm:text-8xl lg:text-9xl text-white leading-[0.88] mb-8 ${heroLoaded ? "animate-fade-in-up" : "opacity-0"}`}
                style={heroLoaded ? { animationDelay: "0.1s" } : {}}>
                {t("hero.title", "Donde tus")}
                <br />
                <span className="shimmer-text">{t("hero.highlight", "sueños")}</span>
                <br />
                {t("hero.subtitle", "florecen")}
              </h1>
              <p className={`text-white/50 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light ${heroLoaded ? "animate-fade-in-up" : "opacity-0"}`}
                style={heroLoaded ? { animationDelay: "0.2s" } : {}}>
                {t("hero.description", "Transformamos tus momentos especiales en experiencias inolvidables con diseños únicos. Santa Cruz · La Paz · Cochabamba · Toda Bolivia")}
              </p>
              <div className={`flex flex-col sm:flex-row gap-5 justify-center ${heroLoaded ? "animate-fade-in-up" : "opacity-0"}`}
                style={heroLoaded ? { animationDelay: "0.3s" } : {}}>
                <a href="#combos"
                  className="group bg-magenta text-white px-10 py-4 text-sm tracking-wider uppercase font-bold hover:bg-magenta-dark transition-all duration-300 inline-flex items-center justify-center gap-3 rounded-full hover:shadow-2xl hover:shadow-magenta/40">
                  {t("hero.cta", "Ver Paquetes")}
                  <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="group border-2 border-white/20 text-white px-10 py-4 text-sm tracking-wider uppercase font-bold hover:border-magenta hover:text-magenta transition-all duration-300 inline-flex items-center justify-center gap-3 rounded-full">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6" />
                  </svg>
                  Escríbenos
                </a>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-warm to-transparent" />
        </section>

        <section id="combos" className="py-28 lg:py-36 px-6 lg:px-10 bg-warm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-magenta text-xs tracking-[0.35em] uppercase font-bold">{t("paquetes.section_label", "Nuestros")}</span>
              <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-navy mt-4 mb-6 font-bold">{t("paquetes.section_title", "Paquetes")}</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-magenta via-gold to-emerald mx-auto rounded-full" />
              <p className="text-stone/50 mt-6 max-w-lg mx-auto text-lg">
                {t("paquetes.section_desc", "Cada paquete incluye montaje, desmontaje y asesoría personalizada sin costo extra.")}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-16">
              {CATEGORIES.map((cat) => (
                <button key={cat.value} onClick={() => setCategory(cat.value)}
                  className={`px-6 py-3 text-xs tracking-widest uppercase font-bold rounded-full transition-all duration-300 ${
                    category === cat.value
                      ? "bg-navy text-white shadow-xl shadow-navy/20"
                      : "bg-white text-stone border border-stone/10 hover:border-magenta hover:text-magenta shadow-sm hover:shadow-md"
                  }`}>
                  {cat.label}
                </button>
              ))}
            </div>

            {!combos ? (
              <div className="flex justify-center py-20">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 border-2 border-magenta border-t-transparent rounded-full animate-spin" />
                  <span className="font-display text-2xl text-stone/40">Cargando...</span>
                </div>
              </div>
            ) : filtered?.length === 0 ? (
              <div className="text-center py-20">
                <Flower className="w-20 h-20 text-stone/10 mx-auto mb-6" />
                <p className="font-display text-3xl text-stone/40">Sin paquetes aquí</p>
                <p className="text-stone/30 mt-2">Probá otra categoría</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {filtered?.map((combo, i) => (
                  <ComboCard key={combo._id} combo={combo} onSelect={pickCombo} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="relative py-28 lg:py-36 overflow-hidden hero-gradient">
          <MorphBlob color="gold" className="top-[-150px] right-[-50px]" />
          <MorphBlob color="emerald" className="bottom-[-150px] left-[-50px]" />
          <div className="absolute inset-0 opacity-[0.03]">
            <Flower className="absolute top-10 right-20 w-72 h-72 text-white animate-float" />
            <Flower className="absolute bottom-10 left-20 w-56 h-56 text-white animate-float-reverse" style={{ animationDelay: "3s" }} />
          </div>
          <div className="relative max-w-4xl mx-auto px-6 lg:px-10 text-center">
            <span className="text-gold/90 text-xs tracking-[0.35em] uppercase font-bold">{t("cta.section_label", "¿Listo?")}</span>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white mt-4 mb-6 leading-tight font-bold">
              {t("cta.title", "Hagamos algo")}
              <br />
              <span className="shimmer-text">{t("cta.highlight", "hermoso")}</span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto mb-12 text-lg font-light">
              {t("cta.description", "Contanos tu visión y crearemos una propuesta personalizada que supere tus expectativas.")}
            </p>
            <a href="#booking-form"
              className="inline-flex items-center gap-3 bg-gold text-navy px-10 py-4 text-sm tracking-wider uppercase font-bold hover:bg-gold-light transition-all duration-300 rounded-full hover:shadow-2xl hover:shadow-gold/30">
              {t("cta.button", "Cotiza ahora")}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </section>

        <section id="booking-form" className="py-28 lg:py-36 px-6 lg:px-10 bg-warm">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-magenta text-xs tracking-[0.35em] uppercase font-bold">{t("cita.section_label", "Reservá tu")}</span>
              <h2 className="font-display text-5xl sm:text-6xl text-navy mt-4 mb-6 font-bold">{t("cita.section_title", "Fecha")}</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-magenta via-gold to-emerald mx-auto rounded-full" />
              <p className="text-stone/50 mt-6 text-lg">{t("cita.section_desc", "Dejanos tus datos y te contactamos al toque para confirmar.")}</p>
            </div>

            {sent ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-white/20 shadow-xl shadow-magenta/5">
                <div className="w-24 h-24 bg-emerald/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <svg className="w-12 h-12 text-emerald" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <p className="font-display text-4xl text-navy mb-3 font-bold">¡Listo! 🎉</p>
                <p className="text-stone/50">Te redirigimos a WhatsApp para ultimar.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="bg-white rounded-3xl border border-white/20 shadow-xl shadow-magenta/5 p-8 sm:p-12 space-y-6">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] tracking-[0.3em] uppercase text-stone/40 mb-2 font-bold">Nombre</label>
                    <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full bg-warm border border-stone/10 rounded-2xl px-5 py-4 text-navy focus:outline-none focus:border-magenta focus:ring-4 focus:ring-magenta/5 transition-all text-sm" />
                    {errors.name && <p className="text-magenta text-xs mt-1.5 font-medium">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.3em] uppercase text-stone/40 mb-2 font-bold">Teléfono</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+591 778 665 43"
                      className="w-full bg-warm border border-stone/10 rounded-2xl px-5 py-4 text-navy focus:outline-none focus:border-magenta focus:ring-4 focus:ring-magenta/5 transition-all text-sm" />
                    {errors.phone && <p className="text-magenta text-xs mt-1.5 font-medium">{errors.phone}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.3em] uppercase text-stone/40 mb-2 font-bold">Fecha del evento</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full bg-warm border border-stone/10 rounded-2xl px-5 py-4 text-navy focus:outline-none focus:border-magenta focus:ring-4 focus:ring-magenta/5 transition-all text-sm [color-scheme:light]" />
                  {errors.date && <p className="text-magenta text-xs mt-1.5 font-medium">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.3em] uppercase text-stone/40 mb-2 font-bold">Combo</label>
                  <select value={form.comboId} onChange={(e) => setForm((p) => ({ ...p, comboId: e.target.value }))}
                    className="w-full bg-warm border border-stone/10 rounded-2xl px-5 py-4 text-navy focus:outline-none focus:border-magenta focus:ring-4 focus:ring-magenta/5 transition-all text-sm">
                    <option value="" className="bg-white">Elegí un combo</option>
                    {combos?.map((c) => (
                      <option key={c._id} value={c._id} className="bg-white">{c.name} — {c.price}</option>
                    ))}
                  </select>
                  {errors.comboId && <p className="text-magenta text-xs mt-1.5 font-medium">{errors.comboId}</p>}
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.3em] uppercase text-stone/40 mb-2 font-bold">Notas (opcional)</label>
                  <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={3}
                    className="w-full bg-warm border border-stone/10 rounded-2xl px-5 py-4 text-navy focus:outline-none focus:border-magenta focus:ring-4 focus:ring-magenta/5 transition-all text-sm resize-none" />
                </div>
                <button type="submit"
                  className="w-full bg-navy text-white rounded-2xl px-8 py-4.5 text-sm tracking-wider uppercase font-bold hover:bg-magenta transition-all duration-300 hover:shadow-xl hover:shadow-magenta/30">
                  {t("cita.submit", "Reservar ahora")}
                </button>
              </form>
            )}
          </div>
        </section>

        <section id="contacto" className="py-28 lg:py-36 px-6 lg:px-10 bg-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
            <Flower className="absolute bottom-0 right-0 w-80 h-80 text-magenta" />
            <Flower className="absolute top-0 left-0 w-56 h-56 text-emerald" />
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <span className="text-gold text-xs tracking-[0.35em] uppercase font-bold">{t("contacto.section_label", "Contacto")}</span>
              <h2 className="font-display text-5xl sm:text-6xl text-navy mt-4 mb-6 font-bold">{t("contacto.section_title", "Estamos acá")}</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-magenta via-gold to-emerald mx-auto rounded-full" />
            </div>
            <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { icon: "whatsapp", title: "WhatsApp", value: whatsapp, href: whatsappLink },
                { icon: "phone", title: "Teléfono", value: t("contact.phone", "+591 778 665 43"), href: null },
                { icon: "location", title: "Cobertura", value: t("contact.location", "Santa Cruz · La Paz · Cochabamba · Toda Bolivia"), href: null },
              ].map((item, i) => (
                <div key={i}
                  className="bg-warm rounded-3xl p-8 sm:p-10 text-center border border-white/20 hover:shadow-2xl hover:shadow-magenta/10 transition-all duration-500 hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-magenta/10 to-emerald/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-magenta">
                    {item.icon === "whatsapp" && (
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    )}
                    {item.icon === "phone" && (
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    )}
                    {item.icon === "location" && (
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                    )}
                  </div>
                  <p className="text-[10px] tracking-[0.35em] uppercase text-stone/40 mb-3 font-bold">{item.title}</p>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-navy font-bold hover:text-magenta transition-colors text-lg">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-navy font-bold text-lg">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-navy text-white/20 py-20 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-10">
              <p className="font-display text-3xl text-white/30 font-bold">
                Follaje<span className="text-magenta/40">&</span>
                <span className="text-emerald/40">Listón</span>
              </p>
              <p className="text-white/10 text-sm mt-3 max-w-md mx-auto">Decoración boutique para tus momentos especiales en Bolivia</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 mb-10 text-xs tracking-widest uppercase font-semibold">
              <a href="#combos" className="text-white/20 hover:text-magenta/60 transition-colors">Paquetes</a>
              <a href="#contacto" className="text-white/20 hover:text-magenta/60 transition-colors">Contacto</a>
              <a href="/admin" className="text-white/20 hover:text-magenta/60 transition-colors">Admin</a>
            </div>
            <div className="border-t border-white/5 pt-8">
              <p className="text-xs tracking-wide text-white/10">&copy; {new Date().getFullYear()} Follaje & Listón — Hecho con ❤️ en Santa Cruz, Bolivia</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
