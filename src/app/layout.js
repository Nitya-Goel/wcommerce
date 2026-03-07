import './globals.css'
import { AppProvider } from '@/context/AppContext'
import { ThemeProvider } from '@/context/ThemeContext'

export const metadata = {
  title: 'W-Commerce X | Autonomous Agentic Marketplace',
  description: 'Built on Weilchain · Powered by WUSD · Team AstroVerse',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <ThemeProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}