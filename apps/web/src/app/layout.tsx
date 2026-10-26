import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebManager — One account. Many useful apps.",
  description:
    "Sign in or create your WebManager account using passwordless email authentication."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
