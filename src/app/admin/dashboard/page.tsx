"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";

type Tab = "citas" | "calendario" | "combos" | "nueva" | "contenido" | "config";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const STATUS_STYLES: Record<string, string> = {
  pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  confirmado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelado: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
};

const DEFAULT_CONTENT: Record<string, string> = {
  "hero.tagline": "Decoración Boutique",
  "hero.title": "Donde tus sueños",
  "hero.highlight": "florecen",
  "hero.subtitle": "en cada detalle",
  "hero.description": "Transformamos tus momentos especiales en experiencias inolvidables con diseños únicos y personalizados para cada celebración.",
  "hero.cta": "Ver Paquetes",
  "paquetes.section_label": "Nuestros",
  "paquetes.section_title": "Paquetes",
  "paquetes.section_desc": "Cada paquete incluye montaje, desmontaje y asesoría personalizada sin costo extra.",
  "cta.section_label": "¿Listo para tu evento?",
  "cta.title": "Hagamos algo hermoso",
  "cta.highlight": "juntos",
  "cta.description": "Cuéntanos tu visión y crearemos una propuesta personalizada que supere tus expectativas.",
  "cta.button": "Solicitar Cotización",
  "cita.section_label": "Agenda tu",
  "cita.section_title": "Cita",
  "cita.section_desc": "Déjanos tus datos y te contactaremos para confirmar todos los detalles.",
  "cita.submit": "Agendar Cita",
  "contacto.section_label": "Contáctanos",
  "contacto.section_title": "Estamos aquí para ti",
};

export default function Dashboard() {
  const { signOut } = useAuthActions();
  const { isLoading } = useConvexAuth();
  const bookings = useQuery(api.bookings.list);
  const combos = useQuery(api.combos.listAll);
  const statusCounts = useQuery(api.bookings.getStatusCounts);
  const updateStatus = useMutation(api.bookings.updateStatus);
  const removeBooking = useMutation(api.bookings.remove);
  const createCombo = useMutation(api.combos.create);
  const updateCombo = useMutation(api.combos.update);
  const deleteCombo = useMutation(api.combos.remove);
  const generateUploadUrl = useMutation(api.combos.generateUploadUrl);
  const saveComboImage = useMutation(api.combos.saveComboImage);
  const contentGetAll = useQuery(api.content.getAll);
  const contentSet = useMutation(api.content.set);
  const adminCreate = useMutation(api.bookings.adminCreate);

  const [tab, setTab] = useState<Tab>("citas");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("todas");

  const [newBooking, setNewBooking] = useState({
    name: "", phone: "", date: "", comboId: "", notes: "", status: "pendiente" as const,
  });

  const [comboForm, setComboForm] = useState({
    name: "", category: "", price: "", description: "", imageUrl: "", active: true,
  });
  const [editingCombo, setEditingCombo] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [contentDraft, setContentDraft] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(null); setSuccess(null); }, 5000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  useEffect(() => {
    setContentDraft({ ...DEFAULT_CONTENT, ...contentGetAll });
  }, [contentGetAll]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const bookingDates = useMemo(() => {
    if (!bookings) return new Set<string>();
    return new Set(bookings.map((b) => b.date));
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    let result = bookings;
    if (selectedDay) result = result.filter((b) => b.date === selectedDay);
    if (statusFilter !== "todas") result = result.filter((b) => b.status === statusFilter);
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bookings, selectedDay, statusFilter]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else { setCurrentMonth((m) => m - 1); }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else { setCurrentMonth((m) => m + 1); }
    setSelectedDay(null);
  };

  const handleDayClick = (day: number) => {
    const date = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDay(selectedDay === date ? null : date);
    setTab("citas");
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminCreate({
        name: newBooking.name, phone: newBooking.phone, date: newBooking.date,
        comboId: newBooking.comboId as any, notes: newBooking.notes || undefined,
        status: newBooking.status,
      });
      setNewBooking({ name: "", phone: "", date: "", comboId: "", notes: "", status: "pendiente" });
      setSuccess("Cita registrada correctamente");
      setTab("citas");
    } catch (err: any) {
      setError(err.message || "Error al registrar la cita");
    }
  };

  const handleComboSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCombo) {
        await updateCombo({ id: editingCombo as any, ...comboForm });
        setEditingCombo(null);
      } else {
        await createCombo(comboForm);
      }
      setComboForm({ name: "", category: "", price: "", description: "", imageUrl: "", active: true });
      setSuccess(editingCombo ? "Combo actualizado" : "Combo creado");
    } catch (err: any) {
      setError(err.message || "Error al guardar el combo");
    }
  };

  const startEditCombo = (combo: any) => {
    setComboForm({
      name: combo.name, category: combo.category, price: combo.price,
      description: combo.description, imageUrl: combo.imageUrl || "",
      active: combo.active ?? true,
    });
    setEditingCombo(combo._id);
    setTab("combos");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg className="animate-spin w-5 h-5 text-rose" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="font-display text-xl text-stone">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
        {error && (
          <div className="fixed top-4 right-4 z-50 bg-rose-50 border border-rose-200 text-rose-700 px-6 py-3 rounded-2xl shadow-lg text-sm flex items-center gap-3 max-w-sm">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto shrink-0 hover:opacity-60">&times;</button>
          </div>
        )}
        {success && (
          <div className="fixed top-4 right-4 z-50 bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-3 rounded-2xl shadow-lg text-sm flex items-center gap-3 max-w-sm">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-auto shrink-0 hover:opacity-60">&times;</button>
          </div>
        )}
        <header className="bg-white/90 backdrop-blur-md border-b border-stone/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <div>
            <a href="/admin/dashboard" className="font-display text-xl text-charcoal tracking-wide hover:text-rose transition-colors">
              Panel de Administración
            </a>
            <p className="text-stone/40 text-xs mt-0.5">Follaje & Listón</p>
          </div>
          <div className="flex items-center gap-4">
            {statusCounts && (
              <div className="hidden sm:flex items-center gap-3 text-xs font-medium">
                <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-600">{statusCounts.pendiente} pend.</span>
                <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">{statusCounts.confirmado} conf.</span>
                <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-600">{statusCounts.cancelado} canc.</span>
              </div>
            )}
            <button onClick={() => signOut()}
              className="text-xs text-stone/40 hover:text-rose transition-colors tracking-wider uppercase font-medium bg-ivory/80 px-4 py-2 rounded-full">
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { key: "citas" as Tab, label: "Citas" },
            { key: "calendario" as Tab, label: "Calendario" },
            { key: "combos" as Tab, label: "Combos" },
            { key: "contenido" as Tab, label: "Contenido" },
            { key: "config" as Tab, label: "Configuración" },
            { key: "nueva" as Tab, label: "+ Nueva Cita" },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 text-xs tracking-widest uppercase font-medium transition-all rounded-full ${
                tab === t.key ? "bg-charcoal text-white shadow-lg" : "bg-white text-stone/50 border border-stone/10 hover:border-rose hover:text-rose"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "calendario" && (
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button onClick={handlePrevMonth}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-colors text-stone/40 hover:text-rose">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <h3 className="font-display text-2xl text-charcoal">{MONTHS[currentMonth]} {currentYear}</h3>
              <button onClick={handleNextMonth}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-colors text-stone/40 hover:text-rose">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-stone/5 shadow-sm overflow-hidden">
              <div className="grid grid-cols-7 bg-ivory/80">
                {DAYS.map((d) => (
                  <div key={d} className="p-3 text-center text-[10px] tracking-widest uppercase text-stone/40 font-medium">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`e-${i}`} className="p-2 min-h-[72px] bg-white/50" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const hasEvents = bookingDates.has(date);
                  return (
                    <button key={day} onClick={() => handleDayClick(day)}
                      className={`p-2 min-h-[72px] text-left transition-all hover:bg-rose/5 ${
                        selectedDay === date ? "bg-rose/10 ring-2 ring-rose ring-inset" : "bg-white"
                      }`}>
                      <span className={`text-sm font-medium ${hasEvents ? "text-rose" : "text-stone/60"}`}>{day}</span>
                      {hasEvents && <div className="w-2 h-2 bg-rose rounded-full mt-1.5 mx-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
            {selectedDay && (
              <p className="text-center text-xs text-stone/40 mt-4">
                Mostrando citas del <span className="text-rose font-medium">{selectedDay}</span>
              </p>
            )}
          </div>
        )}

        {tab === "combos" && (
          <div className="grid lg:grid-cols-2 gap-10">
            <div>
              <h3 className="font-display text-2xl text-charcoal mb-6">
                {editingCombo ? "Editar Combo" : "Nuevo Combo"}
              </h3>
              <form onSubmit={handleComboSubmit} className="bg-white rounded-2xl border border-stone/5 shadow-sm p-8 space-y-4">
                <input placeholder="Nombre del combo" value={comboForm.name}
                  onChange={(e) => setComboForm((p) => ({ ...p, name: e.target.value }))} required
                  className="w-full bg-ivory/80 border border-stone/20 rounded-xl px-4 py-3.5 text-charcoal focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/10 transition-all text-sm" />
                <input placeholder="Categoría (ej. Bodas)" value={comboForm.category}
                  onChange={(e) => setComboForm((p) => ({ ...p, category: e.target.value }))} required
                  className="w-full bg-ivory/80 border border-stone/20 rounded-xl px-4 py-3.5 text-charcoal focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/10 transition-all text-sm" />
                <input placeholder="Precio (ej. $4,500)" value={comboForm.price}
                  onChange={(e) => setComboForm((p) => ({ ...p, price: e.target.value }))} required
                  className="w-full bg-ivory/80 border border-stone/20 rounded-xl px-4 py-3.5 text-charcoal focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/10 transition-all text-sm" />
                <textarea placeholder="Descripción" value={comboForm.description}
                  onChange={(e) => setComboForm((p) => ({ ...p, description: e.target.value }))} required rows={3}
                  className="w-full bg-ivory/80 border border-stone/20 rounded-xl px-4 py-3.5 text-charcoal focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/10 transition-all text-sm resize-none" />
                {uploading ? (
                  <div className="flex items-center gap-3 text-sm text-stone/50 py-3">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Subiendo imagen...
                  </div>
                ) : (
                  <label className="flex items-center gap-3 text-sm text-stone/50 cursor-pointer hover:text-rose transition-colors py-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    <span>{comboForm.imageUrl ? "Cambiar imagen" : "Subir imagen"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      try {
                        const url = await generateUploadUrl();
                        const result = await fetch(url, { method: "POST", body: file });
                        const { storageId } = await result.json();
                        if (editingCombo) {
                          await saveComboImage({ comboId: editingCombo as any, storageId });
                        }
                        setComboForm((p) => ({ ...p, imageUrl: URL.createObjectURL(file) }));
                        setSuccess("Imagen subida correctamente");
                      } catch (err: any) {
                        setError(err.message || "Error al subir imagen");
                      }
                      setUploading(false);
                    }} />
                  </label>
                )}
                {comboForm.imageUrl && !uploading && (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-stone/10">
                    <img src={comboForm.imageUrl} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setComboForm((p) => ({ ...p, imageUrl: "" }))}
                      className="absolute top-1 right-1 w-5 h-5 bg-white/80 rounded-full flex items-center justify-center text-stone/40 hover:text-rose text-xs">
                      &times;
                    </button>
                  </div>
                )}
                {editingCombo && (
                  <label className="flex items-center gap-3 text-sm text-stone/60 cursor-pointer">
                    <input type="checkbox" checked={comboForm.active}
                      onChange={(e) => setComboForm((p) => ({ ...p, active: e.target.checked }))}
                      className="w-4 h-4 rounded border-stone/30 text-rose focus:ring-rose" />
                    Combo activo (visible en página pública)
                  </label>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="submit"
                    className="bg-charcoal text-white px-6 py-3 text-xs tracking-widest uppercase font-medium hover:bg-rose transition-all rounded-xl">
                    {editingCombo ? "Guardar cambios" : "Crear combo"}
                  </button>
                  {editingCombo && (
                    <button type="button" onClick={() => { setEditingCombo(null); setComboForm({ name: "", category: "", price: "", description: "", imageUrl: "", active: true }); }}
                      className="border border-stone/20 text-stone px-6 py-3 text-xs tracking-widest uppercase font-medium hover:border-rose hover:text-rose transition-all rounded-xl">
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
            <div>
              <h3 className="font-display text-2xl text-charcoal mb-6">Combos Existentes</h3>
              {(!combos || combos.length === 0) ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-stone/5">
                  <p className="text-stone/40 font-display text-xl">Todavía no hay combos registrados.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {combos.map((combo) => (
                    <div key={combo._id} className="bg-white rounded-2xl border border-stone/5 p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-lg text-charcoal">{combo.name}</p>
                        <p className="text-xs text-stone/50 mt-0.5">{combo.category} &mdash; {combo.price}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-full ${
                          combo.active ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        }`}>
                          {combo.active ? "Activo" : "Inactivo"}
                        </span>
                        <button onClick={() => startEditCombo(combo)} className="text-xs text-stone/40 hover:text-rose transition-colors font-medium">Editar</button>
                        <button onClick={async () => { try { await deleteCombo({ id: combo._id as any }); setSuccess("Combo eliminado"); } catch (err: any) { setError(err.message || "Error al eliminar"); } }} className="text-xs text-stone/40 hover:text-rose transition-colors font-medium">Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "nueva" && (
          <div className="max-w-lg mx-auto">
            <h3 className="font-display text-2xl text-charcoal mb-6">Registrar Cita Manual</h3>
            <form onSubmit={handleCreateBooking} className="bg-white rounded-2xl border border-stone/5 shadow-sm p-8 space-y-4">
              <input placeholder="Nombre del cliente" value={newBooking.name}
                onChange={(e) => setNewBooking((p) => ({ ...p, name: e.target.value }))} required
                className="w-full bg-ivory/80 border border-stone/20 rounded-xl px-4 py-3.5 text-charcoal focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/10 transition-all text-sm" />
              <input placeholder="Teléfono" value={newBooking.phone}
                onChange={(e) => setNewBooking((p) => ({ ...p, phone: e.target.value }))} required
                className="w-full bg-ivory/80 border border-stone/20 rounded-xl px-4 py-3.5 text-charcoal focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/10 transition-all text-sm" />
              <input type="date" value={newBooking.date}
                onChange={(e) => setNewBooking((p) => ({ ...p, date: e.target.value }))} required
                className="w-full bg-ivory/80 border border-stone/20 rounded-xl px-4 py-3.5 text-charcoal focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/10 transition-all text-sm [color-scheme:light]" />
              <select value={newBooking.comboId}
                onChange={(e) => setNewBooking((p) => ({ ...p, comboId: e.target.value }))} required
                className="w-full bg-ivory/80 border border-stone/20 rounded-xl px-4 py-3.5 text-charcoal focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/10 transition-all text-sm">
                <option value="" className="bg-white">Seleccionar combo</option>
                {combos?.map((c) => (
                  <option key={c._id} value={c._id} className="bg-white">{c.name}</option>
                ))}
              </select>
              <textarea placeholder="Notas (opcional)" value={newBooking.notes}
                onChange={(e) => setNewBooking((p) => ({ ...p, notes: e.target.value }))} rows={3}
                className="w-full bg-ivory/80 border border-stone/20 rounded-xl px-4 py-3.5 text-charcoal focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/10 transition-all text-sm resize-none" />
              <select value={newBooking.status}
                onChange={(e) => setNewBooking((p) => ({ ...p, status: e.target.value as any }))}
                className="w-full bg-ivory/80 border border-stone/20 rounded-xl px-4 py-3.5 text-charcoal focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/10 transition-all text-sm">
                <option value="pendiente" className="bg-white">Pendiente</option>
                <option value="confirmado" className="bg-white">Confirmado</option>
                <option value="cancelado" className="bg-white">Cancelado</option>
              </select>
              <button type="submit"
                className="w-full bg-charcoal text-white rounded-xl px-8 py-3.5 text-sm tracking-wider uppercase font-medium hover:bg-rose transition-all duration-300">
                Registrar Cita
              </button>
            </form>
          </div>
        )}

        {tab === "contenido" && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-2xl text-charcoal">Editar Contenido de la Página</h3>
                <p className="text-stone/50 text-sm mt-1">Los cambios se reflejan inmediatamente en la página principal.</p>
              </div>
              <button onClick={async () => {
                let count = 0;
                for (const [key, value] of Object.entries(contentDraft)) {
                  try { await contentSet({ key, value }); count++; } catch {}
                }
                setSuccess(`${count} textos guardados`);
              }}
                className="bg-charcoal text-white px-5 py-2.5 text-xs tracking-widest uppercase font-medium hover:bg-rose transition-all rounded-xl shrink-0">
                Guardar Todo
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(contentDraft).map(([key, value]) => (
                <div key={key} className="bg-white rounded-2xl border border-stone/5 shadow-sm p-5">
                  <label className="block text-[10px] tracking-widest uppercase text-rose/60 mb-2 font-medium">{key}</label>
                  <textarea value={value} onChange={(e) => setContentDraft((p) => ({ ...p, [key]: e.target.value }))} rows={2}
                    className="w-full bg-ivory/80 border border-stone/20 rounded-xl px-4 py-2.5 text-charcoal focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/10 transition-all text-sm resize-none" />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "config" && (
          <div className="max-w-2xl mx-auto">
            <h3 className="font-display text-2xl text-charcoal mb-6">Configuración del Sitio</h3>
            <p className="text-stone/50 text-sm mb-8">Editá los datos de contacto. Se actualizan al instante en la página.</p>
            <div className="space-y-4">
              {[
                { key: "whatsapp.number", label: "Número de WhatsApp", desc: "Ej: 59177866543 (sin + ni espacios)", input: "tel" },
                { key: "contact.phone", label: "Teléfono de contacto", desc: "Ej: +591 778 665 43", input: "tel" },
                { key: "contact.location", label: "Cobertura / Ubicación", desc: "Ej: Santa Cruz · La Paz · Toda Bolivia", input: "text" },
              ].map(({ key, label, desc, input }) => (
                <div key={key} className="bg-white rounded-2xl border border-stone/5 shadow-sm p-6">
                  <label className="block text-xs tracking-widest uppercase text-rose/60 mb-1 font-medium">{label}</label>
                  <p className="text-[10px] text-stone/30 mb-3">{desc} — clave: <code className="bg-ivory px-1 rounded">{key}</code></p>
                  <input type={input} value={contentDraft[key] || ""}
                    onChange={(e) => setContentDraft((p) => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-ivory/80 border border-stone/20 rounded-xl px-4 py-3 text-charcoal focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/10 transition-all text-sm" />
                  <button onClick={async () => { try { await contentSet({ key, value: contentDraft[key] || "" }); setSuccess(`"${key}" guardado`); } catch (err: any) { setError(err.message); } }}
                    className="mt-3 bg-charcoal text-white px-5 py-2 text-xs tracking-widest uppercase font-medium hover:bg-rose transition-all rounded-xl">
                    Guardar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "citas" && (
          <div>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <h3 className="font-display text-2xl text-charcoal">
                {selectedDay ? `Citas del ${selectedDay}` : "Todas las Citas"}
              </h3>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-stone/20 rounded-xl px-4 py-2 text-xs text-charcoal focus:outline-none focus:border-rose">
                <option value="todas" className="bg-white">Todos los estados</option>
                <option value="pendiente" className="bg-white">Pendiente</option>
                <option value="confirmado" className="bg-white">Confirmado</option>
                <option value="cancelado" className="bg-white">Cancelado</option>
              </select>
            </div>

            {(!filteredBookings || filteredBookings.length === 0) ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-stone/5 shadow-sm">
                <div className="w-16 h-16 bg-rose/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-rose/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <p className="font-display text-xl text-stone/40">Todavía no hay citas registradas</p>
                <p className="text-stone/30 text-sm mt-1">Las citas que los clientes agenden aparecerán aquí.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const combo = combos?.find((c) => c._id === booking.comboId);
                  return (
                    <div key={booking._id} className="bg-white rounded-2xl border border-stone/5 p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                            <h4 className="font-display text-lg text-charcoal">{booking.name}</h4>
                            <span className={`text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[booking.status]}`}>
                              {STATUS_LABELS[booking.status]}
                            </span>
                          </div>
                          <p className="text-xs text-stone/50">{booking.date} &mdash; {booking.phone}</p>
                          {combo && <p className="text-xs text-rose/70 mt-1">{combo.name}</p>}
                          {booking.notes && <p className="text-xs text-stone/40 mt-1.5 italic bg-ivory/50 rounded-lg px-3 py-2 inline-block">&ldquo;{booking.notes}&rdquo;</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {booking.status !== "confirmado" && (
                            <button onClick={async () => { try { await updateStatus({ id: booking._id as any, status: "confirmado" }); setSuccess("Cita confirmada"); } catch (err: any) { setError(err.message); } }}
                              className="text-xs border border-emerald-200 bg-emerald-50 text-emerald-700 px-3.5 py-2 rounded-xl hover:bg-emerald-100 transition-colors font-medium">
                              Confirmar
                            </button>
                          )}
                          {booking.status !== "cancelado" && (
                            <button onClick={async () => { try { await updateStatus({ id: booking._id as any, status: "cancelado" }); setSuccess("Cita cancelada"); } catch (err: any) { setError(err.message); } }}
                              className="text-xs border border-rose-200 bg-rose-50 text-rose-700 px-3.5 py-2 rounded-xl hover:bg-rose-100 transition-colors font-medium">
                              Cancelar
                            </button>
                          )}
                          <button onClick={() => {
                            const msg = `Hola ${booking.name}, tu cita en Follaje & Listón para el ${booking.date} ha sido ${booking.status === "confirmado" ? "confirmada" : "actualizada"}.`;
                            window.open(`https://wa.me/${booking.phone}?text=${encodeURIComponent(msg)}`, "_blank");
                          }} className="w-9 h-9 flex items-center justify-center rounded-xl text-stone/40 hover:text-rose hover:bg-rose/5 transition-all" title="Enviar WhatsApp">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6" />
                            </svg>
                          </button>
                          <button onClick={async () => { try { await removeBooking({ id: booking._id as any }); setSuccess("Cita eliminada"); } catch (err: any) { setError(err.message); } }}
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-stone/30 hover:text-rose hover:bg-rose/5 transition-all">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
