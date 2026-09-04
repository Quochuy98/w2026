import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { getAdminSessionFromCookieHeader } from "@/lib/auth/session";
import sharp from "sharp";
import { scanLocalAlbumFiles, getSavedBannerSrc } from "@/lib/local-album";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALBUM_DIR = path.join(process.cwd(), "public/images/album");
const PERSISTENT_DATA_DIR = "/var/www/w2026-data/album";
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic"]);

function json(data: unknown, init?: ResponseInit): NextResponse {
  const response = NextResponse.json(data, init);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

// GET: Lấy danh sách ảnh local và ảnh banner hiện tại
export async function GET(request: Request): Promise<NextResponse> {
  const cookieHeader = request.headers.get("cookie");
  const session = getAdminSessionFromCookieHeader(cookieHeader);
  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const images = await scanLocalAlbumFiles();
    const bannerSrc = await getSavedBannerSrc();
    return json({ images, bannerSrc });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return json({ error: message }, { status: 500 });
  }
}

// POST: Tải ảnh mới lên thư mục public/images/album/
export async function POST(request: Request): Promise<NextResponse> {
  const cookieHeader = request.headers.get("cookie");
  const session = getAdminSessionFromCookieHeader(cookieHeader);
  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return json({ error: "Vui lòng chọn ít nhất một file ảnh để tải lên." }, { status: 400 });
    }

    await fs.mkdir(ALBUM_DIR, { recursive: true });
    const uploadedNames: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        continue;
      }

      // Giữ tên file an toàn (chữ cái, số, gạch nối, gạch dưới)
      const baseName = path.parse(file.name).name.replace(/[^a-zA-Z0-9_-]/g, "_");
      const buffer = Buffer.from(await file.arrayBuffer());

      // Tự động nén ảnh 20-30MB xuống WebP chuẩn web sắc nét (~250-400KB)
      const safeFileName = `${baseName}.webp`;
      const destinationPath = path.join(ALBUM_DIR, safeFileName);

      try {
        const optimizedBuffer = await sharp(buffer)
          .rotate()
          .resize({
            width: 2400,
            height: 2400,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 82, effort: 4 })
          .toBuffer();

        await fs.writeFile(destinationPath, optimizedBuffer);
        try {
          await fs.writeFile(path.join(PERSISTENT_DATA_DIR, safeFileName), optimizedBuffer);
        } catch {
          // Bỏ qua nếu thư mục này không tồn tại (ví dụ ở môi trường dev local)
        }
        uploadedNames.push(safeFileName);
      } catch {
        const fallbackName = `${baseName}${ext}`;
        await fs.writeFile(path.join(ALBUM_DIR, fallbackName), buffer);
        try {
          await fs.writeFile(path.join(PERSISTENT_DATA_DIR, fallbackName), buffer);
        } catch {
          // Bỏ qua nếu không có
        }
        uploadedNames.push(fallbackName);
      }
    }


    if (uploadedNames.length === 0) {
      return json({ error: "Không có file ảnh hợp lệ (.jpg, .jpeg, .png, .webp, .avif) được tải lên." }, { status: 400 });
    }

    const updatedImages = await scanLocalAlbumFiles();
    const bannerSrc = await getSavedBannerSrc();

    return json({
      success: true,
      message: `Đã tải lên thành công ${uploadedNames.length} ảnh.`,
      uploadedFiles: uploadedNames,
      images: updatedImages,
      bannerSrc,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return json({ error: message }, { status: 500 });
  }
}

// DELETE: Xóa một ảnh khỏi thư mục public/images/album/
export async function DELETE(request: Request): Promise<NextResponse> {
  const cookieHeader = request.headers.get("cookie");
  const session = getAdminSessionFromCookieHeader(cookieHeader);
  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { filename } = await request.json();
    if (!filename || typeof filename !== "string") {
      return json({ error: "Tên file không hợp lệ" }, { status: 400 });
    }

    const safeFileName = path.basename(filename);
    const targetPath = path.join(ALBUM_DIR, safeFileName);

    try {
      await fs.unlink(targetPath);
      try {
        await fs.unlink(path.join(PERSISTENT_DATA_DIR, safeFileName));
      } catch {
        // Bỏ qua
      }
    } catch {
      return json({ error: "Không tìm thấy file ảnh để xóa" }, { status: 404 });
    }

    const updatedImages = await scanLocalAlbumFiles();
    const bannerSrc = await getSavedBannerSrc();

    return json({
      success: true,
      message: `Đã xóa ảnh ${safeFileName} thành công.`,
      images: updatedImages,
      bannerSrc,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return json({ error: message }, { status: 500 });
  }
}
