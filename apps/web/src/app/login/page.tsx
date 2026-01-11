import { LoginForm } from "@/components/auth";

export const metadata = {
  title: "Sign In | CRM",
  description: "Sign in to your CRM account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <LoginForm />
    </div>
  );
}
