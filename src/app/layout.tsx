import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

export const metadata: Metadata = {
  title: "Follaje & Listón | Decoración de Eventos",
  description:
    "Decoración boutique para bodas, cumpleaños, quince años, baby showers y eventos corporativos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-ivory text-charcoal font-body">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
