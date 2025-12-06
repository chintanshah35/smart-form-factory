import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Form Factory – Auto-Generate Beautiful Forms from JSON',
  description: 'A powerful UI tool that transforms JSON schemas into fully styled, accessible, responsive forms. Export to React, Vue, Svelte, or plain HTML.',
  keywords: ['form generator', 'JSON schema', 'React forms', 'Vue forms', 'form builder', 'accessible forms'],
  authors: [{ name: 'Smart Form Factory' }],
  openGraph: {
    title: 'Smart Form Factory – Auto-Generate Beautiful Forms from JSON',
    description: 'Transform JSON schemas into beautiful, accessible forms instantly.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Form Factory',
    description: 'Transform JSON schemas into beautiful, accessible forms instantly.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

