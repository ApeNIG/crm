import type { Metadata } from "next";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "Sign In | CRM",
  description: "Sign in to your CRM account",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login page uses Providers but without the main app chrome (header, navigation)
  return <Providers>{children}</Providers>;
}
