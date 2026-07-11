import { mutation } from "./_generated/server";

export const seedCombos = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("combos").collect();
    if (existing.length > 0) return;

    const combos = [
      {
        name: "Boda Eterna",
        category: "Bodas",
        price: "$12,500",
        description: "Arco floral, centros de mesa, caminera, decoración de sala y mesa de honor. Incluye montaje y desmontaje.",
        active: true,
      },
      {
        name: "Cumpleaños Dorado",
        category: "Cumpleaños",
        price: "$4,800",
        description: "Globos metálicos, centros de mesa, backdrop temático y decoración de pastel.",
        active: true,
      },
      {
        name: "Baby Shower Dulce",
        category: "Baby Shower",
        price: "$3,200",
        description: "Decoración en rosa o azul, centros de mesa, globos y muro de fotos.",
        active: true,
      },
      {
        name: "Quinceañera Imperial",
        category: "Quince Años",
        price: "$8,900",
        description: "Decoración completa del salón, arco, centros de mesa, mantelería y photo booth.",
        active: true,
      },
      {
        name: "Corporativo Ejecutivo",
        category: "Corporativo",
        price: "$6,500",
        description: "Montaje profesional para eventos empresariales, branding, sonido básico y coffee break setup.",
        active: true,
      },
      {
        name: "Boda Íntima",
        category: "Bodas",
        price: "$7,200",
        description: "Decoración para ceremonias pequeñas (hasta 30 invitados). Arco floral, ramo, centros de mesa.",
        active: true,
      },
    ];

    for (const combo of combos) {
      await ctx.db.insert("combos", combo);
    }
  },
});
