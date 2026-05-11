import { auth } from "@/auth";
import { FakeDataGenerator } from "@/components/FakeDataGenerator";

export default async function Home() {
  const session = await auth();
  const signedIn = Boolean(session?.user);

  return (
    <div className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <FakeDataGenerator signedIn={signedIn} />
    </div>
  );
}
