import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Layout } from '@/shared/layouts'
import { AuthProvider } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('@eZion:token');
    
    // Se não está na página de login e não tem token, redireciona
    if (router.pathname !== '/login' && !token) {
      router.push('/login');
    } else {
      setIsAuthChecked(true);
    }
  }, [router.pathname]);

  if (!isAuthChecked && router.pathname !== '/login') {
    return null; // Ou um loading
  }

  // Página de login não usa Layout
  if (router.pathname === '/login') {
    return (
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
