import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-4 gap-6">
      <span className="bg-mustard text-white text-xs font-medium px-3 py-1 rounded-full">
        The Zero-Ops E-Commerce Builder
      </span>
      <h1 className="font-display text-5xl text-bark max-w-2xl">
        Tell us what you sell. We'll build the rest.
      </h1>
      <p className="text-ink/70 max-w-md text-sm">
        Storefront runs a short conversation to understand your business, then generates
        your store, copy, and first ad campaigns automatically.
      </p>
      <Link
        href="/onboarding"
        className="bg-terracotta text-white rounded-full px-6 py-3 text-sm font-medium"
      >
        Start building
      </Link>
    </main>
  );
}
