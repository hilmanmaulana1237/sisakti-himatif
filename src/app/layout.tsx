import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SI SAKTI | Sarana Advokasi - KASTRAD HIMATIF UIN SGD Bandung",
  description: "SI SAKTI (Sarana Advokasi Kajian Strategis & Teknologi Informatika) — Platform advokasi digital mahasiswa Teknik Informatika UIN Sunan Gunung Djati Bandung oleh Bidang Kajian Strategis dan Advokasi (KASTRAD) HIMATIF.",
  icons: {
    icon: "/logo/kastrad.png",
    apple: "/logo/himatif.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
