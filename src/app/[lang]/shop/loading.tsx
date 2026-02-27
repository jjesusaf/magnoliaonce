export default function ShopLoading() {
  return (
    <main className="pt-16 pb-28 lg:pb-0 min-h-dvh flex flex-col">
      <section className="flex-1 flex items-center justify-center px-4 py-10 md:px-8 lg:px-20 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 w-full">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="skeleton aspect-4/5 w-full" />
              <div className="skeleton h-3.5 w-24" />
            </div>
          ))}
        </div>
      </section>

      {/* Footer skeleton */}
      <footer className="hidden lg:block border-t border-base-content/10 px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-6">
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-3 w-10" />
            <div className="skeleton h-3 w-28" />
            <div className="skeleton h-3 w-32" />
          </div>
          <div className="skeleton h-3 w-36" />
        </div>
      </footer>
    </main>
  );
}
