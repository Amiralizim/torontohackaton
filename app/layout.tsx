import type { Metadata } from "next";
import "./globals.css";
import { WizardProvider } from "./lib/wizard-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="hackathon"
      className="h-screen antialiased"
    >
      <body className="min-h-full flex flex-col">
        <WizardProvider>{children}</WizardProvider>
      </body>
    </html>
  );
}
