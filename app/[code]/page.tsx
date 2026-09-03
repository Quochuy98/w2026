import { Metadata } from "next";
import { getPublicAlbumState } from "@/lib/imagekit/gallery";
import { getGuestByCode, incrementGuestView } from "@/lib/guests";
import { WeddingLanding } from "@/components/wedding/wedding-landing";
import { weddingConfig } from "@/content/wedding";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const guest = await getGuestByCode(code);

  if (guest) {
    return {
      title: `Kính mời ${guest.salutation} ${guest.name} | Thiệp Cưới Quốc Huy & Hoài Thương`,
      description: `Trân trọng kính mời ${guest.salutation} ${guest.name} đến chung vui cùng Quốc Huy và Hoài Thương trong ngày hạnh phúc.`,
      openGraph: {
        title: `Kính mời ${guest.salutation} ${guest.name} | Thiệp Cưới Quốc Huy & Hoài Thương`,
        description: `Trân trọng kính mời ${guest.salutation} ${guest.name} đến chung vui cùng Quốc Huy và Hoài Thương trong ngày hạnh phúc.`,
        type: "website",
      },
    };
  }

  return {
    title: weddingConfig.seo.title,
    description: weddingConfig.seo.description,
  };
}

export default async function GuestInvitationPage({ params }: PageProps) {
  const { code } = await params;
  const [album, guest] = await Promise.all([
    getPublicAlbumState(),
    getGuestByCode(code),
  ]);

  if (guest) {
    // Asynchronously record view without blocking page render
    incrementGuestView(code).catch(() => {});
  }

  return (
    <WeddingLanding
      images={album.images}
      slots={album.slots}
      isFallback={album.isFallback}
      guest={guest}
      groomCrop={album.groomCrop}
      brideCrop={album.brideCrop}
    />
  );
}

