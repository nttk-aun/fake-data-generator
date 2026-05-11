import { FakeDataGenerator } from "@/components/FakeDataGenerator";

export default function Home() {
  return (
    <div className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <FakeDataGenerator />
    </div>
  );
}
