import { Metadata } from "next";
import { getPublicAlbumState } from "@/lib/gallery";
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
  const siteUrl = weddingConfig.seo.siteUrl || "https://wedding.quochuy.me";
  const bannerImageUrl = `${siteUrl}/og/og-banner.jpg`;

  if (guest) {
    const title = `Kính mời ${guest.salutation} ${guest.name} | Thiệp Cưới Quốc Huy & Hoài Thương`;
    const description = `Trân trọng kính mời ${guest.salutation} ${guest.name} đến chung vui cùng Quốc Huy và Hoài Thương trong ngày hạnh phúc.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${siteUrl}/${code}`,
        siteName: `Thiệp Cưới ${weddingConfig.groom} & ${weddingConfig.bride}`,
        locale: "vi_VN",
        type: "website",
        images: [
          {
            url: bannerImageUrl,
            secureUrl: bannerImageUrl,
            width: 1200,
            height: 630,
            alt: title,
            type: "image/jpeg",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [bannerImageUrl],
      },
    };
  }

  return {
    title: weddingConfig.seo.title,
    description: weddingConfig.seo.description,
    openGraph: {
      title: weddingConfig.seo.title,
      description: weddingConfig.seo.description,
      url: `${siteUrl}/${code}`,
      siteName: `Thiệp Cưới ${weddingConfig.groom} & ${weddingConfig.bride}`,
      locale: "vi_VN",
      type: "website",
      images: [
        {
          url: bannerImageUrl,
          secureUrl: bannerImageUrl,
          width: 1200,
          height: 630,
          alt: weddingConfig.seo.title,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: weddingConfig.seo.title,
      description: weddingConfig.seo.description,
      images: [bannerImageUrl],
    },
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

