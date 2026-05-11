import Link from "next/link";
import { logoutAction } from "@/app/actions/logout";
import type { SessionPayload } from "@/lib/auth/jwt";

export default function AppHeader({
  session,
}: {
  session: SessionPayload | null;
}) {
  return (
    <header className="border-b border-zinc-200 bg-white/90 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          Fake Data Generator
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {session ? (
            <>
              <span
                className="max-w-[160px] truncate text-zinc-600 dark:text-zinc-400"
                title={session.email}
              >
                {session.email}
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  ออกจากระบบ
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-zinc-700 hover:underline dark:text-zinc-300"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                สมัครสมาชิก
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
