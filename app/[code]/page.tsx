import { Metadata } from "next";
import { getPublicAlbumState } from "@/lib/gallery";
import { getGuestByCode, incrementGuestView, incrementMissedGuestView } from "@/lib/guests";
import { WeddingLanding } from "@/components/wedding/wedding-landing";
import { MissedLanding } from "@/components/wedding/missed-landing";
import { weddingConfig } from "@/content/wedding";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const guest = await getGuestByCode(code);
  const siteUrl = weddingConfig.seo.siteUrl || "https://wedding.quochuy.me";
  const bannerImageUrl = `${siteUrl}/og/og-banner.jpg`;

  if (guest) {
    const title = `Kính mời ${guest.salutation} ${guest.name} | Thiệp Cưới ${weddingConfig.groom} & ${weddingConfig.bride}`;
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

  const title = `Hehehe bạn đã bỏ lỡ điều gì à? | Thiệp Cưới ${weddingConfig.groom} & ${weddingConfig.bride}`;
  const description = `Dù bạn truy cập đường dẫn nào, tình cảm của bạn dành cho Quốc Huy & Hoài Thương luôn là món quà trân quý nhất.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: `Thiệp Cưới ${weddingConfig.groom} & ${weddingConfig.bride}`,
      locale: "vi_VN",
      type: "website",
    },
  };
}

export default async function DynamicGuestPage({ params }: PageProps) {
  const { code } = await params;
  const guest = await getGuestByCode(code);

  if (guest) {
    // Khách mời có trong dữ liệu Supabase -> Hiển thị đúng thiệp cưới gốc đầy đủ
    const album = await getPublicAlbumState();
    incrementGuestView(code).catch(() => {});

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

  // Không có trong Supabase (mã không tồn tại) -> Hiển thị màn hình MissedLanding
  if (code) {
    incrementMissedGuestView(code).catch(() => {});
  }

  return <MissedLanding guest={null} code={code} />;
}
