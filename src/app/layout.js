// app/layout.js (layout raiz)
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayoutLayout from './ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Pernas na Areia',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ClientLayoutLayout>{children}</ClientLayoutLayout>
      </body>
    </html>
  );
}