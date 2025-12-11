FROM debian:bullseye

# 1. Update system
RUN apt-get update && apt-get upgrade -y

# 2. Install Chrome + dependencies
RUN apt-get install -y wget gnupg2 curl unzip fontconfig locales \
    libxshmfence-dev libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 \
    libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 \
    libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 \
    libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
    libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 \
    libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
    fonts-liberation libappindicator1 lsb-release xdg-utils

# Download Chrome
RUN wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && dpkg -i google-chrome-stable_current_amd64.deb || true \
    && apt-get install -yf

# 3. Install Node.js 18+
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# 4. Create working directory
WORKDIR /app

# 5. Copy project files
COPY package.json ./
COPY yarn.lock ./
RUN yarn install || npm install

COPY src ./src

EXPOSE 21465

# 6. Start server
CMD ["node", "src/server.js"]
