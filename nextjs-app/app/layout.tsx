import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Lenny's Podcast Episodes - 3D Relational Graph",
  description: 'Interactive 3D visualization of Lenny\'s Podcast episodes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

