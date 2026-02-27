export default function CategoryLoading() {
  return (
    <main className="pt-16 pb-28 lg:pb-0 flex flex-col min-h-dvh">
      {/* Header section — matches px-6 pt-10 pb-6 lg:px-16 lg:pt-14 lg:pb-8 */}
      <section className="px-6 pt-10 pb-6 lg:px-16 lg:pt-14 lg:pb-8 flex flex-col gap-6">
        {/* Breadcrumbs skeleton */}
        <div className="breadcrumbs text-sm">
          <ul>
            <li><div className="skeleton h-3.5 w-14" /></li>
            <li><div className="skeleton h-3.5 w-20" /></li>
          </ul>
        </div>

        {/* Title skeleton */}
        <div className="skeleton h-9 lg:h-10 w-48 lg:w-64" />

        {/* Description skeleton */}
        <div className="flex flex-col gap-1.5 max-w-3xl">
          <div className="skeleton h-3.5 w-full" />
          <div className="skeleton h-3.5 w-3/4" />
        </div>
      </section>

      {/* Product grid — matches px-4 pb-8 lg:px-16 lg:pb-12 */}
      <section className="flex-1 px-4 pb-8 lg:px-16 lg:pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col">
              <div className="skeleton aspect-[3/4] w-full rounded-box" />
              <div className="p-3 lg:p-4 space-y-2">
                <div className="skeleton h-3 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
