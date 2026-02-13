export default function ShopLoading() {
  return (
    <main className="pt-16 pb-28 lg:pb-0 lg:h-dvh lg:overflow-hidden flex flex-col">
      <section className="flex-1 flex items-center px-6 py-6 lg:px-16 lg:py-4 min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full lg:h-full">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center lg:min-h-0">
              <div className="skeleton aspect-[3/4] w-full lg:aspect-auto lg:flex-1 lg:min-h-0"></div>
              <div className="skeleton h-5 w-32 mt-4"></div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
