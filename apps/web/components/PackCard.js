import Link from "next/link";
import Image from "next/image";
import { Card } from "ui";

export function PackCard({ pack }) {
  return (
    <Link href={`/packs/${pack.id}`} passHref>
      <Card className="p-0 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
        <Image
          src={pack.cover_image_url || "/placeholder-image.png"}
          alt={`Cover for ${pack.name}`}
          width={400}
          height={400}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="p-4">
          <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-200">{pack.name}</h3>
        </div>
      </Card>
    </Link>
  );
}