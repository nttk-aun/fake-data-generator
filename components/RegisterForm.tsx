"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { logError } from "@/lib/logger";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setError(null);
        if (password !== confirm) {
          setError("รหัสผ่านยืนยันไม่ตรงกัน");
          return;
        }
        if (password.length < 8) {
          setError("รหัสผ่านอย่างน้อย 8 ตัวอักษร");
          return;
        }
        setLoading(true);
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ email, password }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) {
          setError(data.error ?? "สมัครไม่สำเร็จ");
          return;
        }
        router.refresh();
        router.push("/");
      } catch (err) {
        logError("RegisterForm_onSubmit", err);
        setError("เครือข่ายผิดพลาด ลองใหม่");
      } finally {
        setLoading(false);
      }
    },
    [confirm, email, password, router],
  );

  return (
    <form
      onSubmit={(ev) => {
        void onSubmit(ev);
      }}
      className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40"
    >
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        สมัครสมาชิก
      </h1>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">อีเมล</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">รหัสผ่าน (อย่างน้อย 8 ตัว)</span>
        <input
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">ยืนยันรหัสผ่าน</span>
        <input
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(ev) => setConfirm(ev.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="h-10 rounded-lg bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {loading ? "กำลังสมัคร…" : "สร้างบัญชี"}
      </button>
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        มีบัญชีแล้ว?{" "}
        <Link href="/login" className="font-medium text-emerald-700 underline dark:text-emerald-400">
          เข้าสู่ระบบ
        </Link>
      </p>
    </form>
  );
}
