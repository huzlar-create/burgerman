import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, user } = await requireUser();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link href="/admin" className="rounded-full border-[1.5px] border-streg px-4 py-1 font-semibold">
          Oversigt
        </Link>
        {profile?.is_admin && (
          <Link
            href="/admin/ny"
            className="rounded-full border-[1.5px] border-ristet bg-ketchup px-4 py-1 font-semibold text-white"
          >
            + Ny anmeldelse
          </Link>
        )}
        <span className="ml-auto text-sm opacity-80">{profile?.display_name ?? user.email}</span>
        <form action={signOut}>
          <button className="rounded-full border-[1.5px] border-streg px-4 py-1 text-sm">Log ud</button>
        </form>
      </div>
      {children}
    </div>
  );
}
