FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund

FROM node:22-bookworm-slim AS builder
WORKDIR /app
ARG SITE_URL=https://thuraya-alshamsi.gate-digital.com
ENV SITE_URL=$SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run content:validate && npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/db ./db
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/content/generated ./content/generated
RUN mkdir -p /app/storage/private /app/storage/public && chown -R nextjs:nodejs /app/storage
USER nextjs
EXPOSE 3000
CMD ["node", "scripts/boot-runtime.mjs"]
