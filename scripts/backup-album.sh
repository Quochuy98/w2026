#!/usr/bin/env bash
# ==============================================================================
# SCRIPT BACKUP TỰ ĐỘNG ALBUM ẢNH CƯỚI & CẤU HÌNH HỆ THỐNG
# Dự án: Thiệp Cưới Quốc Huy & Hoài Thương (w2026)
# ==============================================================================
set -euo pipefail

BACKUP_DIR="${HOME}/backups/w2026"
DATA_DIR="/var/www/w2026-data"
APP_DIR="/var/www/w2026"
ENV_FILE="${APP_DIR}/.env.local"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATE_READABLE=$(date +"%d/%m/%Y %H:%M:%S")
ARCHIVE_NAME="w2026_album_backup_${TIMESTAMP}.tar.gz"
ARCHIVE_PATH="${BACKUP_DIR}/${ARCHIVE_NAME}"

echo "=========================================================="
echo ">>> [${DATE_READABLE}] Bắt đầu tiến trình Backup..."
echo "=========================================================="

# 1. Tạo thư mục lưu trữ backup
mkdir -p "${BACKUP_DIR}"

# 1.5. Đồng bộ ảnh mới nhất từ dự án vào thư mục lưu trữ độc lập
if [ -d "${APP_DIR}/public/images/album" ]; then
  mkdir -p "${DATA_DIR}/album"
  cp -r -u "${APP_DIR}/public/images/album"/* "${DATA_DIR}/album/" 2>/dev/null || true
fi

# 2. Xác định thư mục ảnh cần nén
ALBUM_PATH="${DATA_DIR}/album"
if [ ! -d "${ALBUM_PATH}" ]; then
  ALBUM_PATH="${APP_DIR}/public/images/album"
fi

if [ ! -d "${ALBUM_PATH}" ]; then
  echo ">>> [LỖI] Không tìm thấy thư mục ảnh tại ${ALBUM_PATH}"
  exit 1
fi

TOTAL_PHOTOS=$(find "${ALBUM_PATH}" -maxdepth 1 -type f \( -name "*.webp" -o -name "*.jpg" -o -name "*.png" \) | wc -l || echo 0)
echo ">>> Tìm thấy ${TOTAL_PHOTOS} file ảnh trong album."

# 3. Tiến hành đóng gói nén tar.gz
echo ">>> Đang nén dữ liệu vào ${ARCHIVE_PATH}..."
ITEMS_TO_BACKUP=()
if [ -d "${ALBUM_PATH}" ]; then
  ITEMS_TO_BACKUP+=("-C" "$(dirname "${ALBUM_PATH}")" "$(basename "${ALBUM_PATH}")")
fi

if [ -f "${DATA_DIR}/banner.json" ]; then
  ITEMS_TO_BACKUP+=("-C" "${DATA_DIR}" "banner.json")
elif [ -f "${APP_DIR}/content/banner.json" ]; then
  ITEMS_TO_BACKUP+=("-C" "${APP_DIR}/content" "banner.json")
fi

tar -czf "${ARCHIVE_PATH}" "${ITEMS_TO_BACKUP[@]}"

FILE_SIZE=$(ls -lh "${ARCHIVE_PATH}" | awk '{print $5}')
echo ">>> Tạo file backup thành công: ${ARCHIVE_NAME} (${FILE_SIZE})"

# 4. Tự động gửi qua Telegram nếu có cấu hình trong .env.local
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""

if [ -f "${ENV_FILE}" ]; then
  TELEGRAM_BOT_TOKEN=$(grep -E '^TELEGRAM_BOT_TOKEN=' "${ENV_FILE}" | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)
  TELEGRAM_CHAT_ID=$(grep -E '^TELEGRAM_CHAT_ID=' "${ENV_FILE}" | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)
fi

TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-${ENV_TELEGRAM_BOT_TOKEN:-}}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-${ENV_TELEGRAM_CHAT_ID:-}}"

if [ -n "${TELEGRAM_BOT_TOKEN}" ] && [ -n "${TELEGRAM_CHAT_ID}" ]; then
  echo ">>> Đang gửi bản backup về Telegram Chat (${TELEGRAM_CHAT_ID})..."
  CAPTION="💍 *Backup Album Cưới Tự Động* (%0ANgày: ${DATE_READABLE}%0ASố lượng ảnh: ${TOTAL_PHOTOS}%0ADung lượng: ${FILE_SIZE})"
  
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument" \
    -F chat_id="${TELEGRAM_CHAT_ID}" \
    -F caption="${CAPTION}" \
    -F parse_mode="Markdown" \
    -F document=@"${ARCHIVE_PATH}")

  if [ "${HTTP_CODE}" = "200" ]; then
    echo ">>> Đã gửi bản backup thành công về Telegram!"
  else
    echo ">>> Gửi Telegram không thành công (HTTP ${HTTP_CODE}). Tiếp tục lưu trữ cục bộ."
  fi
else
  echo ">>> [GỢI Ý] Chưa cấu hình TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID. Bản backup chỉ được lưu trên server."
fi

# 5. Dọn dẹp bản backup cũ quá 7 ngày để tiết kiệm dung lượng ổ cứng
echo ">>> Dọn dẹp các bản backup cũ hơn 7 ngày..."
find "${BACKUP_DIR}" -name "w2026_album_backup_*.tar.gz" -type f -mtime +7 -delete || true

echo "=========================================================="
echo ">>> BACKUP HOÀN TẤT THÀNH CÔNG!"
echo "=========================================================="
