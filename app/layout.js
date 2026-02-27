import './globals.css';
import ClientLayout from './ClientLayout';
import { Space_Mono, Roboto_Mono } from 'next/font/google';

const spaceMono = Space_Mono({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap'
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-roboto-mono',
  display: 'swap'
});

export const metadata = {
  title: 'RedFlag AI Scanner — The Dark Archive 🚩',
  description: 'Unlicensed AI analysis of your toxic conversations. Expose the red flags.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${spaceMono.variable} ${robotoMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="animated-bg" />
        <main style={{ position: 'relative', zIndex: 1 }}>
          <ClientLayout>
            {children}
          </ClientLayout>
        </main>
      </body>
    </html>
  );
}
