import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Log ind",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-3xl text-ketchup">LOG IND</h1>
      <p className="mt-2 mb-6">Skriv din mail, så sender vi dig et link. Ingen adgangskode.</p>
      <LoginForm />
    </div>
  );
}
