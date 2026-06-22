import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Placement Compass - Track. Improve. Get Placement Ready.',
  description:
    'Placement Compass helps students measure their placement preparation progress, identify skill gaps, and improve with personalized analytical guidance and mentor support.',
  keywords: ['placement readiness', 'campus placements', 'career tracking', 'student dashboard'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
