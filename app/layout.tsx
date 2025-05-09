import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Script from "next/script";
import { AuthProvider } from "@/context/auth-context";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AniNew - Watch Anime Online",
  description: "Watch the latest anime online for free in HD quality with English subtitles or dubbed. AniNew is your one-stop destination for all your anime needs.",
  keywords: "anime, streaming, watch anime, free anime, anime online, HD anime, subbed anime, dubbed anime, AniNew",
  authors: [{ name: "AniNew Team" }],
  openGraph: {
    title: "AniNew - Watch Anime Online",
    description: "Watch the latest anime online for free in HD quality with English subtitles or dubbed.",
    url: "https://aninew.vercel.app",
    siteName: "AniNew",
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  twitter: {
    card: "summary_large_image",
    title: "AniNew - Watch Anime Online",
    description: "Watch the latest anime online for free in HD quality with English subtitles or dubbed.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <style>
          {`
            /* Custom scrollbar styles */
            ::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            
            ::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.1);
              border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb {
              background: #e11d48;
              border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
              background: #f43f5e;
            }
            
            /* Firefox scrollbar */
            * {
              scrollbar-width: thin;
              scrollbar-color: #e11d48 rgba(0, 0, 0, 0.1);
            }
            
            /* Fix theme inconsistencies */
            body.dark {
              background-color: #000;
              color: #fff;
            }
            
            body.light {
              background-color: #fff;
              color: #000;
            }
            
            /* Remove vertical overflow from home page */
            html, body {
              overflow-x: hidden;
              max-width: 100%;
            }
          `}
        </style>
      </head>
      <body className={`${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          forcedTheme="dark"
        >
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <div className="flex flex-1 flex-col md:flex-row">
                <Sidebar />
                <main className="flex-1 overflow-x-hidden">{children}</main>
              </div>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}