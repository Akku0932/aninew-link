import type React from "react"
import type { Metadata } from "next/types"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Footer from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ANINEW - Watch Anime Online",
  description: "Watch the latest anime online in HD quality",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Load HLS.js from CDN with specific version for stability */}
        <Script
          src="https://cdn.jsdelivr.net/npm/hls.js@1.4.12/dist/hls.min.js"
          strategy="beforeInteractive"
          integrity="sha256-Xo1jz/4QVY0UpFfQE/VGzusgcxJiwj2cJgmGd7nWJhE="
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} dark:bg-black dark:text-white bg-white text-black transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="flex min-h-screen flex-col">
            <Header />
            <div className="flex flex-1 flex-col md:flex-row">
              <Sidebar />
              <main className="flex-1 overflow-x-hidden scrollbar-hide">{children}</main>
            </div>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'