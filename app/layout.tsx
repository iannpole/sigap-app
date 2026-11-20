import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import SplashLoader from "@/components/SplashLoader";
import "./globals.css";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "SIGAP Bogor",
  description: "Peta layanan kesehatan, keamanan, olahraga, dan hiburan di Bogor.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <Script
          id="sigap-tema"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("sigap-tema")==="gelap")document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body className={`${font.variable} font-sans antialiased`}>
        <SplashLoader />
        {children}
      </body>
    </html>
  );
}