import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { auth } from "../../auth";
import { AssistantWidget } from "@/components/assistant-widget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Bug Tracker",
  description:
    "A team-ready bug tracking workspace with projects, workflows, analytics, and audit trails.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        {session?.user?.id && session.user.accountType !== "admin" ? <AssistantWidget /> : null}
      </body>
    </html>
  );
}
