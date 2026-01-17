# =========================
# Stage 1: Builder
# =========================
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

COPY src ./src
COPY student_private.pem student_public.pem instructor_public.pem ./
COPY cron ./cron

# =========================
# Stage 2: Runtime
# =========================
FROM node:20-alpine

ENV NODE_ENV=production
ENV DATA_DIR=/data
ENV CRON_DIR=/cron
ENV TZ=UTC

WORKDIR /app

# Install cron + tzdata
RUN apk add --no-cache bash tzdata busybox-suid

# Copy app from builder
COPY --from=builder /app /app

# Create required dirs
RUN mkdir -p /data /cron \
  && chmod 700 /data /cron

# Install cron job (CRITICAL)
RUN crontab /app/cron/2fa-cron

EXPOSE 8080

# IMPORTANT: run as root (cron needs it)
CMD sh -c "crond -l 8 && node src/server.js"
