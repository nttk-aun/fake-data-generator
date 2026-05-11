import Link from "next/link";
import { auth } from "@/auth";
import { signInWithGoogleAction, signOutAction } from "@/app/actions/google-auth";

export default async function AppHeader() {
  const session = await auth();

  return (
    <header className="border-b border-zinc-200 bg-white/90 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-zinc-900 hover:underline dark:text-zinc-100"
        >
          Fake Data Generator
        </Link>
        <nav className="flex items-center gap-2">
          {session?.user ? (
            <>
              <span
                className="max-w-[180px] truncate text-xs text-zinc-600 dark:text-zinc-400"
                title={session.user.email ?? ""}
              >
                {session.user.name ?? session.user.email}
              </span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  ออกจากระบบ
                </button>
              </form>
            </>
          ) : (
            <form action={signInWithGoogleAction}>
              <button
                type="submit"
                className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-sm ring-1 ring-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-600 dark:hover:bg-zinc-800"
              >
                เข้าสู่ระบบด้วย Google
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
