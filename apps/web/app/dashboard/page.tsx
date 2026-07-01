import { db } from "@/lib/db";

// merchantId stubbed for scaffold clarity — wire to auth session.
const merchantId = "demo-merchant";

export default async function DashboardPage() {
  const store = await db.store.findUnique({
    where: { merchantId },
    include: { products: true, media: true },
  });

  return (
    <main className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl text-bark mb-6">Storefront Builder</h1>

      <div className="grid grid-cols-[220px_1fr] gap-6">
        <nav className="flex flex-col gap-1 text-sm text-ink/80">
          {["Dashboard", "Products", "Media", "Orders", "Design", "Settings"].map((item) => (
            <div
              key={item}
              className="px-3 py-2 rounded-lg hover:bg-white cursor-pointer first:bg-white first:font-medium"
            >
              {item}
            </div>
          ))}
        </nav>

        <section className="bg-white rounded-xl2 p-6 shadow-sm">
          <h2 className="font-medium text-ink mb-4">Storefront preview</h2>
          {store ? (
            <div className="border border-bark/10 rounded-xl2 p-6 bg-cream whitespace-pre-line text-sm">
              {store.heroCopy ?? "Generating homepage copy…"}
            </div>
          ) : (
            <p className="text-sm text-ink/60">
              No store yet — complete onboarding to generate your first draft.
            </p>
          )}

          <h2 className="font-medium text-ink mt-8 mb-3">Products ({store?.products.length ?? 0})</h2>
          <div className="grid grid-cols-3 gap-4">
            {store?.products.map((p) => (
              <div key={p.id} className="border border-bark/10 rounded-xl2 p-3 text-sm">
                <div className="font-medium">{p.title}</div>
                <div className="text-ink/60">₹{p.price}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
