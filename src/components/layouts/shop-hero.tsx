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
    <section className="flex-1 flex items-center justify-center px-4 py-10 md:px-8 lg:px-20 lg:py-12">
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
              <div className="aspect-4/5 w-full overflow-hidden bg-base-200">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={name}
                    width={800}
                    height={1000}
                    sizes="(min-width: 768px) 33vw, 100vw"
                    priority
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <h2 className="text-sm tracking-widest uppercase text-base-content/70 group-hover:text-base-content transition-colors">
                {name}
              </h2>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
