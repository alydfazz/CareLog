import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Maintenance & Service Log',
  description:
    'Catatan riwayat perawatan barang berharga dan pelacak total biaya servis',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-slate-100 text-slate-800 antialiased">{children}</body>
    </html>
  );
}