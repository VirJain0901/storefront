import IntakeChat from "@/components/IntakeChat";

// merchantId would normally come from auth session; stubbed here for scaffold clarity.
export default function OnboardingPage() {
  const merchantId = "demo-merchant";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="text-center max-w-lg">
        <h1 className="font-display text-4xl text-bark">Let's build your store</h1>
        <p className="text-ink/70 mt-2 text-sm">
          A few quick questions, then Storefront generates your homepage, copy, and first
          campaigns automatically.
        </p>
      </div>
      <IntakeChat merchantId={merchantId} />
    </main>
  );
}
