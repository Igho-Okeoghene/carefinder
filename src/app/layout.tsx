import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

// Initialize Poppins font
const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "Carefinder Nigeria",
  description: "Find hospitals and healthcare facilities in Nigeria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}