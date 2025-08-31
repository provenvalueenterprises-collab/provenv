import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '../contexts/NextAuthContext'
import '../index.css'
import '../app/globals.css'

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </SessionProvider>
  )
}
