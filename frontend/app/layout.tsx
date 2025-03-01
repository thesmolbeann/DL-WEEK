import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Layout } from "@/components/layout"
import './globals.css'

export const metadata = {
  generator: 'v0.dev'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Layout>{children}</Layout>
        </ThemeProvider>
      </body>
    </html>
  )
}
