import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import './globals.css'

export const metadata = {
  title: 'Life Tracker',
  description: 'Your personal daily tracker',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "'Inter', sans-serif", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}