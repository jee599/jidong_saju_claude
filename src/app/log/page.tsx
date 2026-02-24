import { OpsLoginForm } from "@/components/ops/OpsLoginForm";

export default function OpsLoginPage() {
  return (
    <main className="min-h-screen bg-bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold text-accent mb-8">
          Ops Dashboard
        </h1>
        <OpsLoginForm />
      </div>
    </main>
  );
}
