import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ónix",
  description: "Clon web de Obsidian: tus notas en la web",
};

// Restaura el preset de color antes del primer pintado (default: neutral).
const PRESET_SCRIPT = `(function(){try{document.documentElement.dataset.theme=localStorage.getItem("onix-color-preset")||"neutral"}catch(e){document.documentElement.dataset.theme="neutral"}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      data-theme="neutral"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: script estático sin entrada de usuario */}
        <script dangerouslySetInnerHTML={{ __html: PRESET_SCRIPT }} />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
