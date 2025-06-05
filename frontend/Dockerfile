FROM node:18

WORKDIR /app
COPY package.json .
COPY pnpm-lock.yaml .

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install

COPY . .

EXPOSE 3000
CMD ["pnpm", "dev"]
