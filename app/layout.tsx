import { Geist, Geist_Mono, Manrope } from "next/font/google"

import "./globals.css"
import { SiteHeader } from "@/components/layout/site-header"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "dark antialiased",
        fontMono.variable,
        manrope.variable,
        "font-sans",
        geist.variable
      )}
      style={{ colorScheme: "dark" }}
    >
      <body className="bg-[#05050a] text-white">
        <ThemeProvider defaultTheme="dark" enableSystem={false}>
          <SiteHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
