import Image from "next/image";

export default function CheckoutLoading() {
  return (
    <div className="min-h-dvh bg-base-100 flex flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-base-100/80 backdrop-blur-xl border-b border-base-content/10">
        <div className="max-w-3xl mx-auto flex items-center gap-4 px-6 py-3">
          <div className="p-1.5">
            <div className="size-4" />
          </div>
          <div className="logo-stack grid">
            <Image src="/images/logo.svg" alt="Magnolia Once" width={120} height={24} className="logo-dark h-5 w-auto" />
            <Image src="/images/logo-light.svg" alt="Magnolia Once" width={120} height={24} className="logo-light h-5 w-auto" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10 md:py-14">
        {/* Title */}
        <div className="skeleton h-8 w-52 mb-8" />

        {/* Section label */}
        <div className="skeleton h-3.5 w-40 mb-4" />

        {/* Order items */}
        <div className="divide-y divide-base-200">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-4">
              <div className="skeleton w-16 h-16 shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="skeleton h-3.5 w-3/4" />
                <div className="skeleton h-3 w-1/3" />
                <div className="skeleton h-3 w-8" />
              </div>
              <div className="skeleton h-4 w-16 shrink-0" />
            </div>
          ))}
        </div>

        {/* Coupon input */}
        <div className="flex gap-2 mt-8">
          <div className="skeleton h-12 flex-1" />
          <div className="skeleton h-12 w-24" />
        </div>

        {/* Totals */}
        <div className="space-y-2.5 py-4 mt-6 border-t border-base-content/10">
          <div className="flex justify-between">
            <div className="skeleton h-3.5 w-16" />
            <div className="skeleton h-3.5 w-20" />
          </div>
          <div className="flex justify-between">
            <div className="skeleton h-3 w-28" />
            <div className="skeleton h-3 w-16" />
          </div>
          <div className="flex justify-between">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-3 w-14" />
          </div>
          <div className="flex justify-between pt-3 border-t border-base-content/10">
            <div className="skeleton h-4 w-12" />
            <div className="skeleton h-5 w-24" />
          </div>
        </div>

        {/* CTA button */}
        <div className="skeleton h-14 w-full mt-6" />
      </main>
    </div>
  );
}
