import type { MetadataRoute } from "next";
import { listAllGuests } from "@/lib/guests";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://wedding.quochuy.me";

  try {
    const guests = await listAllGuests();

    const guestEntries: MetadataRoute.Sitemap = guests.map((guest) => ({
      url: `${baseUrl}/${guest.code}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
      ...guestEntries,
    ];
  } catch {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
    ];
  }
}
