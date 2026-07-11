"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";

type Tab = "citas" | "calendario" | "combos" | "nueva";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  pendiente: "border-l-dorado text-dorado",
  confirmado: "border-l-green-500 text-green-400",
  cancelado: "border-l-rosa text-rosa",
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
  const adminCreate = useMutation(api.bookings.adminCreate);

  const [tab, setTab] = useState<Tab>("citas");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("todas");

  const [showNewForm, setShowNewForm] = useState(false);

  const [newBooking, setNewBooking] = useState({
    name: "", phone: "", date: "", comboId: "", notes: "", status: "pendiente" as const,
  });

  const [comboForm, setComboForm] = useState({
    name: "", category: "", price: "", description: "", imageUrl: "",
  });
  const [editingCombo, setEditingCombo] = useState<string | null>(null);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const bookingDates = useMemo(() => {
    if (!bookings) return new Set<string>();
    return new Set(bookings.map((b) => b.date));
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    let result = bookings;
    if (selectedDay) {
      result = result.filter((b) => b.date === selectedDay);
    }
    if (statusFilter !== "todas") {
      result = result.filter((b) => b.status === statusFilter);
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bookings, selectedDay, statusFilter]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const handleDayClick = (day: number) => {
    const date = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDay(selectedDay === date ? null : date);
    setTab("citas");
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminCreate({
      name: newBooking.name,
      phone: newBooking.phone,
      date: newBooking.date,
      comboId: newBooking.comboId as any,
      notes: newBooking.notes || undefined,
      status: newBooking.status,
    });
    setNewBooking({ name: "", phone: "", date: "", comboId: "", notes: "", status: "pendiente" });
    setShowNewForm(false);
  };

  const handleComboSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCombo) {
      await updateCombo({
        id: editingCombo as any,
        ...comboForm,
        active: true,
      });
      setEditingCombo(null);
    } else {
      await createCombo(comboForm);
    }
    setComboForm({ name: "", category: "", price: "", description: "", imageUrl: "" });
  };

  const startEditCombo = (combo: any) => {
    setComboForm({
      name: combo.name,
      category: combo.category,
      price: combo.price,
      description: combo.description,
      imageUrl: combo.imageUrl || "",
    });
    setEditingCombo(combo._id);
    setTab("combos");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-fondo flex items-center justify-center">
        <div className="text-dorado font-display text-2xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fondo">
      <header className="border-b border-dorado/10 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <a href="/admin/dashboard" className="font-display text-xl text-dorado tracking-wider">
              Panel de Administración
            </a>
            <p className="text-crema/40 text-xs mt-0.5">Follaje & Listón</p>
          </div>
          <div className="flex items-center gap-4">
            {statusCounts && (
              <div className="hidden sm:flex items-center gap-3 text-xs">
                <span className="text-dorado">{statusCounts.pendiente} pend.</span>
                <span className="text-green-400">{statusCounts.confirmado} conf.</span>
                <span className="text-rosa">{statusCounts.cancelado} canc.</span>
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="text-xs text-crema/40 hover:text-rosa transition-colors tracking-wider uppercase"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-8 border-b border-dorado/10 pb-4">
          {[
            { key: "citas", label: "Citas" },
            { key: "calendario", label: "Calendario" },
            { key: "combos", label: "Combos" },
            { key: "nueva", label: "+ Nueva Cita" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as Tab)}
              className={`px-4 py-2 text-xs tracking-widest uppercase transition-colors ${
                tab === t.key
                  ? "text-dorado border-b border-dorado"
                  : "text-crema/40 hover:text-crema/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "calendario" && (
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button onClick={handlePrevMonth} className="text-crema/50 hover:text-dorado transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <h3 className="font-display text-2xl text-dorado">
                {MONTHS[currentMonth]} {currentYear}
              </h3>
              <button onClick={handleNextMonth} className="text-crema/50 hover:text-dorado transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-px bg-dorado/20">
              {DAYS.map((d) => (
                <div key={d} className="bg-superficie p-2 text-center text-[10px] tracking-widest uppercase text-crema/40">
                  {d}
                </div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-superficie p-2 min-h-[60px] sm:min-h-[80px]" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const hasEvents = bookingDates.has(date);
                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`bg-superficie p-2 min-h-[60px] sm:min-h-[80px] text-left transition-colors hover:bg-[#1a2a20] ${
                      selectedDay === date ? "ring-1 ring-dorado" : ""
                    }`}
                  >
                    <span className={`text-xs sm:text-sm ${hasEvents ? "text-dorado font-semibold" : "text-crema/50"}`}>
                      {day}
                    </span>
                    {hasEvents && (
                      <div className="w-1.5 h-1.5 bg-dorado rounded-full mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
            {selectedDay && (
              <p className="text-center text-xs text-crema/50 mt-4">
                Mostrando citas del <span className="text-dorado">{selectedDay}</span>
              </p>
            )}
          </div>
        )}

        {tab === "combos" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="font-display text-2xl text-dorado mb-6">
                {editingCombo ? "Editar Combo" : "Nuevo Combo"}
              </h3>
              <form onSubmit={handleComboSubmit} className="space-y-4">
                <input
                  placeholder="Nombre"
                  value={comboForm.name}
                  onChange={(e) => setComboForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full bg-transparent border border-crema/20 px-4 py-3 text-crema focus:outline-none focus:border-dorado text-sm"
                />
                <input
                  placeholder="Categoría"
                  value={comboForm.category}
                  onChange={(e) => setComboForm((p) => ({ ...p, category: e.target.value }))}
                  required
                  className="w-full bg-transparent border border-crema/20 px-4 py-3 text-crema focus:outline-none focus:border-dorado text-sm"
                />
                <input
                  placeholder="Precio (ej. $4,500)"
                  value={comboForm.price}
                  onChange={(e) => setComboForm((p) => ({ ...p, price: e.target.value }))}
                  required
                  className="w-full bg-transparent border border-crema/20 px-4 py-3 text-crema focus:outline-none focus:border-dorado text-sm"
                />
                <textarea
                  placeholder="Descripción"
                  value={comboForm.description}
                  onChange={(e) => setComboForm((p) => ({ ...p, description: e.target.value }))}
                  required
                  rows={3}
                  className="w-full bg-transparent border border-crema/20 px-4 py-3 text-crema focus:outline-none focus:border-dorado text-sm resize-none"
                />
                <input
                  placeholder="URL de imagen (opcional)"
                  value={comboForm.imageUrl}
                  onChange={(e) => setComboForm((p) => ({ ...p, imageUrl: e.target.value }))}
                  className="w-full bg-transparent border border-crema/20 px-4 py-3 text-crema focus:outline-none focus:border-dorado text-sm"
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="border border-dorado bg-dorado/10 text-dorado px-6 py-2 text-xs tracking-widest uppercase hover:bg-dorado/20 transition-colors"
                  >
                    {editingCombo ? "Guardar cambios" : "Crear combo"}
                  </button>
                  {editingCombo && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCombo(null);
                        setComboForm({ name: "", category: "", price: "", description: "", imageUrl: "" });
                      }}
                      className="border border-crema/20 text-crema/60 px-6 py-2 text-xs tracking-widest uppercase hover:bg-crema/5 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
            <div>
              <h3 className="font-display text-2xl text-dorado mb-6">Combos Existentes</h3>
              {(!combos || combos.length === 0) ? (
                <p className="text-crema/50 text-sm">Todavía no hay combos registrados.</p>
              ) : (
                <div className="space-y-3">
                  {combos.map((combo) => (
                    <div key={combo._id} className="bg-superficie border border-crema/10 p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-lg text-crema">{combo.name}</p>
                        <p className="text-xs text-crema/50">{combo.category} &mdash; {combo.price}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] tracking-wider uppercase ${combo.active ? "text-green-400" : "text-rosa"}`}>
                          {combo.active ? "Activo" : "Inactivo"}
                        </span>
                        <button
                          onClick={() => startEditCombo(combo)}
                          className="text-xs text-dorado hover:text-dorado-claro transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteCombo({ id: combo._id as any })}
                          className="text-xs text-rosa/60 hover:text-rosa transition-colors"
                        >
                          Eliminar
                        </button>
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
            <h3 className="font-display text-2xl text-dorado mb-6">Registrar Cita Manual</h3>
            <form onSubmit={handleCreateBooking} className="space-y-4">
              <input
                placeholder="Nombre del cliente"
                value={newBooking.name}
                onChange={(e) => setNewBooking((p) => ({ ...p, name: e.target.value }))}
                required
                className="w-full bg-transparent border border-crema/20 px-4 py-3 text-crema focus:outline-none focus:border-dorado text-sm"
              />
              <input
                placeholder="Teléfono"
                value={newBooking.phone}
                onChange={(e) => setNewBooking((p) => ({ ...p, phone: e.target.value }))}
                required
                className="w-full bg-transparent border border-crema/20 px-4 py-3 text-crema focus:outline-none focus:border-dorado text-sm"
              />
              <input
                type="date"
                value={newBooking.date}
                onChange={(e) => setNewBooking((p) => ({ ...p, date: e.target.value }))}
                required
                className="w-full bg-transparent border border-crema/20 px-4 py-3 text-crema focus:outline-none focus:border-dorado text-sm [color-scheme:dark]"
              />
              <select
                value={newBooking.comboId}
                onChange={(e) => setNewBooking((p) => ({ ...p, comboId: e.target.value }))}
                required
                className="w-full bg-superficie border border-crema/20 px-4 py-3 text-crema focus:outline-none focus:border-dorado text-sm"
              >
                <option value="" className="bg-superficie">Seleccionar combo</option>
                {combos?.map((c) => (
                  <option key={c._id} value={c._id} className="bg-superficie">{c.name}</option>
                ))}
              </select>
              <textarea
                placeholder="Notas (opcional)"
                value={newBooking.notes}
                onChange={(e) => setNewBooking((p) => ({ ...p, notes: e.target.value }))}
                rows={3}
                className="w-full bg-transparent border border-crema/20 px-4 py-3 text-crema focus:outline-none focus:border-dorado text-sm resize-none"
              />
              <select
                value={newBooking.status}
                onChange={(e) => setNewBooking((p) => ({ ...p, status: e.target.value as any }))}
                className="w-full bg-superficie border border-crema/20 px-4 py-3 text-crema focus:outline-none focus:border-dorado text-sm"
              >
                <option value="pendiente" className="bg-superficie">Pendiente</option>
                <option value="confirmado" className="bg-superficie">Confirmado</option>
                <option value="cancelado" className="bg-superficie">Cancelado</option>
              </select>
              <button
                type="submit"
                className="w-full border border-dorado bg-dorado/10 text-dorado px-8 py-3 text-sm tracking-widest uppercase hover:bg-dorado/20 transition-colors"
              >
                Registrar Cita
              </button>
            </form>
          </div>
        )}

        {tab === "citas" && (
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <h3 className="font-display text-2xl text-dorado mr-4">
                {selectedDay ? `Citas del ${selectedDay}` : "Todas las Citas"}
              </h3>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-superficie border border-crema/20 px-3 py-1.5 text-xs text-crema focus:outline-none focus:border-dorado"
              >
                <option value="todas" className="bg-superficie">Todos los estados</option>
                <option value="pendiente" className="bg-superficie">Pendiente</option>
                <option value="confirmado" className="bg-superficie">Confirmado</option>
                <option value="cancelado" className="bg-superficie">Cancelado</option>
              </select>
            </div>

            {(!filteredBookings || filteredBookings.length === 0) ? (
              <div className="text-center py-16">
                <p className="text-crema/40 font-display text-2xl">Todavía no hay citas registradas</p>
                <p className="text-crema/30 text-sm mt-2">Las citas que los clientes agenden aparecerán aquí.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((booking) => {
                  const combo = combos?.find((c) => c._id === booking.comboId);
                  return (
                    <div
                      key={booking._id}
                      className={`bg-superficie border border-crema/10 border-l-4 ${STATUS_COLORS[booking.status]} p-4 sm:p-5`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-display text-lg text-crema">{booking.name}</h4>
                            <span className={`text-[10px] tracking-wider uppercase px-2 py-0.5 border ${
                              booking.status === "pendiente" ? "border-dorado/30 text-dorado" :
                              booking.status === "confirmado" ? "border-green-500/30 text-green-400" :
                              "border-rosa/30 text-rosa"
                            }`}>
                              {STATUS_LABELS[booking.status]}
                            </span>
                          </div>
                          <p className="text-xs text-crema/60">
                            {booking.date} &mdash; {booking.phone}
                          </p>
                          {combo && (
                            <p className="text-xs text-dorado/80 mt-1">
                              {combo.name} &mdash; {combo.price}
                            </p>
                          )}
                          {booking.notes && (
                            <p className="text-xs text-crema/50 mt-1 italic">{booking.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {booking.status !== "confirmado" && (
                            <button
                              onClick={() => updateStatus({ id: booking._id as any, status: "confirmado" })}
                              className="text-xs border border-green-500/30 text-green-400 px-3 py-1 hover:bg-green-500/10 transition-colors"
                            >
                              Confirmar
                            </button>
                          )}
                          {booking.status !== "cancelado" && (
                            <button
                              onClick={() => updateStatus({ id: booking._id as any, status: "cancelado" })}
                              className="text-xs border border-rosa/30 text-rosa px-3 py-1 hover:bg-rosa/10 transition-colors"
                            >
                              Cancelar
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const msg = `Hola ${booking.name}, tu cita en Follaje & Listón para el ${booking.date} ha sido ${booking.status === "confirmado" ? "confirmada" : "actualizada"}.`;
                              window.open(`https://wa.me/${booking.phone}?text=${encodeURIComponent(msg)}`, "_blank");
                            }}
                            className="text-xs text-dorado hover:text-dorado-claro transition-colors px-2"
                            title="Enviar WhatsApp"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M22 16.92v3a2 2 0 0 1 -2.18 2a19.79 19.79 0 0 1 -8.63 -3.07a19.5 19.5 0 0 1 -6 -6a19.79 19.79 0 0 1 -3.07 -8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72a12.84 12.84 0 0 0 .7 2.81a2 2 0 0 1 -.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27 -1.27a2 2 0 0 1 2.11 -.45a12.84 12.84 0 0 0 2.81 .7A2 2 0 0 1 22 16.92z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeBooking({ id: booking._id as any })}
                            className="text-xs text-rosa/50 hover:text-rosa transition-colors"
                          >
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
