import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ALBUM_DIR = path.join(process.cwd(), "public/images/album");
const TARGET_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".heic", ".tiff", ".webp"]);

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function run() {
  console.log("🔍 Đang quét thư mục ảnh cưới public/images/album/ ...\n");

  try {
    await fs.mkdir(ALBUM_DIR, { recursive: true });
    const entries = await fs.readdir(ALBUM_DIR, { withFileTypes: true });

    const files = entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((name) => TARGET_EXTENSIONS.has(path.extname(name).toLowerCase()));

    if (files.length === 0) {
      console.log("ℹ️ Không tìm thấy file ảnh nào trong public/images/album/.");
      return;
    }

    let totalOldSize = 0;
    let totalNewSize = 0;
    let optimizedCount = 0;

    for (const filename of files) {
      const filePath = path.join(ALBUM_DIR, filename);
      const stat = await fs.stat(filePath);
      const ext = path.extname(filename).toLowerCase();
      const baseName = path.parse(filename).name;

      // Nếu đã là .webp và dung lượng dưới 800KB thì đã tối ưu
      if (ext === ".webp" && stat.size < 800 * 1024) {
        totalOldSize += stat.size;
        totalNewSize += stat.size;
        continue;
      }

      console.log(`⏳ Đang tối ưu: ${filename} (${formatSize(stat.size)}) ...`);

      try {
        const destFileName = `${baseName}.webp`;
        const destPath = path.join(ALBUM_DIR, destFileName);

        const buffer = await fs.readFile(filePath);
        const optimized = await sharp(buffer)
          .rotate() // Tự động xoay đúng chiều
          .resize({
            width: 2400,
            height: 2400,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 82, effort: 4 })
          .toBuffer();

        await fs.writeFile(destPath, optimized);

        // Nếu đổi từ .jpg/.png sang .webp thì xóa file cũ
        if (filePath !== destPath) {
          await fs.unlink(filePath);
        }

        const savedPercent = (((stat.size - optimized.length) / stat.size) * 100).toFixed(1);
        console.log(`   ✅ Hoàn tất -> ${destFileName}: ${formatSize(optimized.length)} (Giảm ${savedPercent}%!)\n`);

        totalOldSize += stat.size;
        totalNewSize += optimized.length;
        optimizedCount++;
      } catch (err) {
        console.error(`   ❌ Lỗi khi tối ưu ${filename}:`, err);
        totalOldSize += stat.size;
        totalNewSize += stat.size;
      }
    }

    console.log("==================================================");
    if (optimizedCount > 0) {
      const totalSaved = (((totalOldSize - totalNewSize) / totalOldSize) * 100).toFixed(1);
      console.log(`🎉 Đã tối ưu thành công ${optimizedCount} bức ảnh!`);
      console.log(`📊 Tổng dung lượng: ${formatSize(totalOldSize)} ➔ ${formatSize(totalNewSize)} (Tiết kiệm ${totalSaved}%)`);
      console.log("🚀 Web bây giờ sẽ tải siêu nhanh và cực kỳ sắc nét trên mọi thiết bị!");
    } else {
      console.log("✨ Tất cả ảnh trong thư mục đều đã được tối ưu đạt chuẩn WebP!");
    }
    console.log("==================================================");
  } catch (err) {
    console.error("Lỗi:", err);
  }
}

run();
