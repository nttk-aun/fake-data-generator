import { Suspense } from "react";
import { auth } from "@/auth";
import { BillingAlert } from "@/components/BillingAlert";
import { FakeDataGenerator } from "@/components/FakeDataGenerator";
import { FREE_BULK_MIN } from "@/lib/bulk-export";
import { logError } from "@/lib/logger";
import { isNextDynamicServerError } from "@/lib/next-dynamic";

export default async function Home() {
  try {
    const session = await auth();
    const signedIn = Boolean(session?.user);
    const maxBulkRowsWhenSignedIn = Math.max(
      FREE_BULK_MIN,
      session?.billing?.maxBulkRows ?? (signedIn ? 100 : 10),
    );

    return (
      <div className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <Suspense fallback={null}>
          <BillingAlert />
        </Suspense>
        <FakeDataGenerator
          signedIn={signedIn}
          maxBulkRowsWhenSignedIn={maxBulkRowsWhenSignedIn}
        />
      </div>
    );
  } catch (error) {
    if (isNextDynamicServerError(error)) {
      throw error;
    }
    logError("Home", error);
    return (
      <div className="p-10 text-center text-sm text-red-600">
        โหลดหน้าไม่สำเร็จ ลองรีเฟรช
      </div>
    );
  }
}
