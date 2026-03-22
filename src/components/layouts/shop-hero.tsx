import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/storage";
import { getCategories } from "@/lib/queries";
import { localized } from "@/lib/i18n-helpers";

const BUCKET = "magnolia";

type Props = {
  lang: string;
};

export async function ShopHero({ lang }: Props) {
  const categories = await getCategories();

  return (
    <section className="flex-1 flex items-center justify-center px-4 py-10 md:px-8 lg:px-12 lg:py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 w-full">
        {categories.map((cat) => {
          const name = localized(cat, "name", lang);
          const imageUrl = cat.image_path
            ? getImageUrl(BUCKET, cat.image_path, { width: 800, height: 1000, resize: "cover" })
            : null;

          return (
            <Link
              key={cat.id}
              href={`/${lang}/shop/${cat.slug}`}
              className="group flex flex-col gap-2"
            >
              <div className="aspect-square w-full overflow-hidden bg-base-200 relative">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={name}
                    width={cat.image_width ?? 800}
                    height={cat.image_height ?? 1000}
                    sizes="(min-width: 768px) 33vw, 100vw"
                    priority
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                {/* Overlay con nombre en hover */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-500">
                  <span className="text-white text-2xl md:text-3xl lg:text-4xl tracking-widest uppercase opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500">
                    {name}
                  </span>
                </div>
              </div>
              <h2 className="text-sm tracking-widest uppercase text-base-content/70 group-hover:text-base-content transition-colors text-center">
                {name}
              </h2>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
