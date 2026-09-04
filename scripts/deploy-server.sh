#!/usr/bin/env bash
set -e

echo "=========================================================="
echo ">>> Bắt đầu tiến trình triển khai tự động lên Oracle Cloud"
echo "=========================================================="

# 1. Cấu hình Swap RAM (2GB) để chống tràn RAM khi build
echo ">>> [1/6] Kiểm tra Swap RAM..."
if [ ! -f /swapfile ]; then
  echo "Tạo 2GB swapfile..."
  sudo fallocate -l 2G /swapfile 2>/dev/null || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  echo "Đã kích hoạt 2GB Swap."
else
  echo "Swap đã tồn tại."
fi

# 2. Cấu hình Firewall Ubuntu (iptables) cho cổng 80 & 443
echo ">>> [2/6] Cấu hình tường lửa iptables cho Port 80 & 443..."
sudo iptables -C INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 1 -p tcp --dport 80 -j ACCEPT
sudo iptables -C INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 1 -p tcp --dport 443 -j ACCEPT
if command -v netfilter-persistent >/dev/null 2>&1; then
  sudo netfilter-persistent save || true
fi

# 3. Tự động cài đặt Node.js 22 LTS & PM2 nếu chưa có
echo ">>> [3/6] Kiểm tra Node.js & PM2..."
if ! command -v node >/dev/null 2>&1; then
  echo "Cài đặt Node.js 22 LTS..."
  sudo apt-get update -y
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs git
fi
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

if ! command -v pm2 >/dev/null 2>&1; then
  echo "Cài đặt PM2..."
  sudo npm install -g pm2
  pm2 startup systemd -u ubuntu --hp /home/ubuntu || true
fi

# 4. Tự động cài đặt & cấu hình Caddy Reverse Proxy (HTTPS cho domain & port 80)
echo ">>> [4/6] Kiểm tra Caddy Reverse Proxy..."
if ! command -v caddy >/dev/null 2>&1; then
  echo "Cài đặt Caddy Server..."
  sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg --yes
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
  sudo apt-get update -y
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y caddy
fi

# Cập nhật cấu hình Caddy cho cả domain và IP
cat << 'EOF' | sudo tee /etc/caddy/Caddyfile
wedding.quochuy.me {
    handle /images/* {
        root * /var/www/w2026/public
        file_server
    }
    handle {
        reverse_proxy 127.0.0.1:3000
    }
}

:80 {
    handle /images/* {
        root * /var/www/w2026/public
        file_server
    }
    handle {
        reverse_proxy 127.0.0.1:3000
    }
}
EOF
sudo systemctl reload caddy || sudo systemctl restart caddy

# 4.5. Đảm bảo thư mục lưu trữ ảnh độc lập (/var/www/w2026-data) và Symlink an toàn
echo ">>> [4.5/6] Kiểm tra cấu trúc lưu trữ ảnh độc lập (/var/www/w2026-data)..."
sudo mkdir -p /var/www/w2026-data/album
sudo chown -R ubuntu:ubuntu /var/www/w2026-data
mkdir -p /var/www/w2026/public/images
if [ ! -L /var/www/w2026/public/images/album ]; then
  if [ -d /var/www/w2026/public/images/album ]; then
    cp -r -n /var/www/w2026/public/images/album/* /var/www/w2026-data/album/ 2>/dev/null || true
    rm -rf /var/www/w2026/public/images/album
  fi
  ln -sfn /var/www/w2026-data/album /var/www/w2026/public/images/album
fi

# 5. Cài đặt dependencies và build Next.js
echo ">>> [5/6] Cài đặt dependencies & Build Next.js..."
cd /var/www/w2026
npm install
npm run build

# 6. Khởi động / Khởi động lại ứng dụng với PM2
echo ">>> [6/6] Khởi động ứng dụng bằng PM2..."
pm2 describe w2026 >/dev/null 2>&1 && pm2 restart w2026 --update-env || pm2 start npm --name "w2026" --cwd /var/www/w2026 -- start
pm2 save

echo "=========================================================="
echo ">>> TRIỂN KHAI THÀNH CÔNG!"
echo "=========================================================="
