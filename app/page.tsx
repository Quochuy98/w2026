import { getPublicAlbumState } from "@/lib/gallery";

import { WeddingLanding } from "@/components/wedding/wedding-landing";

export const revalidate = 60;

export default async function HomePage() {
  const album = await getPublicAlbumState();

  return (
    <WeddingLanding
      images={album.images}
      slots={album.slots}
      isFallback={album.isFallback}
      groomCrop={album.groomCrop}
      brideCrop={album.brideCrop}
    />
  );
}

