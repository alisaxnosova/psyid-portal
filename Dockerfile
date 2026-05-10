# ── Build portal ──────────────────────────────────────────
FROM node:22-alpine AS portal-builder
WORKDIR /build/portal

COPY package*.json ./
RUN npm ci

COPY . .
# exclude admin folder from portal build
RUN npm run build

# ── Build admin ───────────────────────────────────────────
FROM node:22-alpine AS admin-builder
WORKDIR /build/admin

COPY admin/package*.json ./
RUN npm ci

COPY admin/ .

ARG BACKEND_URL=http://159.194.222.35:3010
ENV BACKEND_URL=$BACKEND_URL

RUN npm run build

# ── Final image ───────────────────────────────────────────
FROM node:22-alpine AS runner

RUN apk add --no-cache nginx supervisor

ENV NODE_ENV=production

# Portal
WORKDIR /app/portal
COPY --from=portal-builder /build/portal/public ./public
COPY --from=portal-builder /build/portal/.next/standalone ./
COPY --from=portal-builder /build/portal/.next/static ./.next/static

# Admin
WORKDIR /app/admin
COPY --from=admin-builder /build/admin/public ./public
COPY --from=admin-builder /build/admin/.next/standalone ./
COPY --from=admin-builder /build/admin/.next/static ./.next/static

# Nginx + supervisord config
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 80

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
