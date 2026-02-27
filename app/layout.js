import './globals.css';
import ClientLayout from './ClientLayout';

export const metadata = {
  title: 'RedFlag AI Scanner — Expose the Red Flags 🚩',
  description: 'Upload your profile photo and get a sarcastic red flag analysis with a toxicity score. AI-powered personality roast.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
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
