import { Metadata } from "next";
import { getGuestByCode, incrementMissedGuestView } from "@/lib/guests";
import { MissedLanding } from "@/components/wedding/missed-landing";
import { weddingConfig } from "@/content/wedding";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const guest = await getGuestByCode(code);

  const title = guest
    ? `Trân trọng kính mời ${guest.salutation} ${guest.name} | Thiệp Cưới ${weddingConfig.groom} & ${weddingConfig.bride}`
    : `Hehehe bạn đã bỏ lỡ điều gì à? | Thiệp Cưới ${weddingConfig.groom} & ${weddingConfig.bride}`;

  const description = guest
    ? `Kính mời ${guest.salutation} ${guest.name} đến chung vui cùng Quốc Huy và Hoài Thương.`
    : `Dù bạn truy cập đường dẫn nào, tình cảm của bạn dành cho Quốc Huy & Hoài Thương luôn là món quà trân quý nhất.`;

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

  if (code) {
    // Record missed page view ping separately in Supabase
    incrementMissedGuestView(code).catch(() => {});
  }

  const guest = await getGuestByCode(code);

  return <MissedLanding guest={guest} code={code} />;
}
