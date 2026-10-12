#!/bin/bash
# ==============================================================================
# EnglishReader - 自动化生产环境部署脚本
# 适用系统: Ubuntu 22.04 LTS / Debian 12
# ==============================================================================

set -e

echo "========================================================"
echo "🚀 开始自动化部署 EnglishReader 原著阅读平台"
echo "========================================================"

# 1. 更新系统包与安装基础依赖
echo "📦 [1/6] 更新系统软件包与基础环境..."
apt update -y
apt install -y curl git python3 python3-pip unzip sqlite3

# 2. 安装 Node.js 22 LTS
echo "⚡ [2/6] 安装 Node.js 22 LTS..."
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'.' -f1) != "v22" ]]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt install -y nodejs
fi

echo "✓ Node.js 版本: $(node -v)"
echo "✓ npm 版本: $(npm -v)"

# 3. 全局安装 PM2 进程守护
echo "🛡️ [3/6] 安装 PM2 进程守护管理器..."
npm install -g pm2

# 4. 配置代码目录
TARGET_DIR="/var/www/EnglishReader"
echo "📥 [4/6] 同步代码至 ${TARGET_DIR}..."

if [ -d "$TARGET_DIR" ]; then
    echo "Found existing directory, pulling latest changes..."
    cd "$TARGET_DIR"
    git fetch origin main
    git reset --hard origin/main
else
    mkdir -p /var/www
    cd /var/www
    git clone https://github.com/Fuhrer-Meiji/EnglishReader.git
    cd EnglishReader
fi

# 5. 安装依赖、构建 77 万词离线词典与编译
echo "📚 [5/6] 安装项目依赖与构建 770,000 离线词典..."
npm install

if [ ! -f "apps/web/data/dict.db" ]; then
    echo "正在下载并生成 ECDICT 离线数据库..."
    npm run setup:dict
else
    echo "✓ 检测到现有词典文件 (dict.db)，跳过生成"
fi

echo "🔨 正在编译 Next.js 生产环境..."
npm run build

# 6. 配置 PM2 启动服务（监听 80 端口）
echo "🌐 [6/6] 启动后台服务 (绑定 80 端口)..."
pm2 delete english-reader 2>/dev/null || true

PORT=80 pm2 start npm --name "english-reader" -- run start --workspace=web -- -p 80

pm2 startup systemd -u root --hp /root 2>/dev/null || true
pm2 save

echo "========================================================"
echo "🎉 部署完成！"
echo "EnglishReader 已在后台持久运行！"
echo "你可以打开浏览器访问: http://$(curl -s ifconfig.me)"
echo "========================================================"
