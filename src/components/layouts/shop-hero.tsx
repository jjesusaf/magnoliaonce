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
    <section className="flex-1 flex items-center px-6 py-6 lg:px-16 lg:py-4 min-h-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full lg:h-full">
        {categories.map((cat) => {
          const name = localized(cat, "name", lang);
          const imageUrl = cat.image_path
            ? getImageUrl(BUCKET, cat.image_path, { width: 600, height: 800, resize: "cover" })
            : null;

          return (
            <Link
              key={cat.id}
              href={`/${lang}/shop/${cat.slug}`}
              className="group flex flex-col items-center lg:min-h-0"
            >
              <div className="aspect-3/4 w-full overflow-hidden bg-base-200 lg:aspect-auto lg:flex-1 lg:min-h-0">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={name}
                    width={600}
                    height={800}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <h2 className="mt-4 text-lg md:text-xl tracking-widest uppercase text-base-content/80 group-hover:text-base-content transition-colors">
                {name}
              </h2>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
