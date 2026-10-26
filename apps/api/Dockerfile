FROM node:22-bookworm-slim
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/api/package.json ./apps/api/package.json
RUN pnpm install --no-frozen-lockfile
COPY . .
EXPOSE 4000
CMD ["pnpm", "--filter", "@webmanager/api", "dev"]
