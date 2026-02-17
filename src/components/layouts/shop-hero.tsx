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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
        {categories.map((cat) => {
          const name = localized(cat, "name", lang);
          const imageUrl = cat.image_path
            ? getImageUrl(BUCKET, cat.image_path, { width: 600, height: 600, resize: "cover" })
            : null;

          return (
            <Link
              key={cat.id}
              href={`/${lang}/shop/${cat.slug}`}
              className="group flex flex-col items-center"
            >
              <div className="aspect-square w-full overflow-hidden bg-base-200">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={name}
                    width={600}
                    height={600}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <h2 className="mt-5 text-lg md:text-xl tracking-widest uppercase text-base-content/80 group-hover:text-base-content transition-colors">
                {name}
              </h2>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
