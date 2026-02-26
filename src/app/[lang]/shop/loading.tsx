export default function ShopLoading() {
  return (
    <main className="pt-16 pb-28 lg:pb-0 min-h-dvh flex flex-col">
      <section className="flex-1 flex items-center justify-center px-4 py-10 md:px-8 lg:px-20 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full max-w-6xl">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="skeleton aspect-[3/4] w-full rounded-box"></div>
              <div className="skeleton h-5 w-32 mt-5"></div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
