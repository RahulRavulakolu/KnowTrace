import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import QueryProvider from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'KnowledgeTrace',
  description:
    'KnowledgeTrace is a source-anchored adaptive AI tutor for personalized learning.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body
        className="min-h-full bg-black text-[#E1E0CC] selection:bg-[#DEDBC8] selection:text-black"
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>
            {children}
            <AuthModal />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
