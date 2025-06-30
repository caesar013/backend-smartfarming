# syntax=docker/dockerfile:1
ARG NODE_IMAGE=node:18.20.5-alpine3.20

FROM $NODE_IMAGE AS base
RUN apk --no-cache add dumb-init
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node
RUN mkdir tmp

FROM base AS dependencies
COPY --chown=node:node ./package*.json ./
RUN npm ci
COPY --chown=node:node . .

RUN chmod +x ./dockerConfig/run.sh

USER root

# === PERUBAHAN KUNCI DI SINI ===
# Install su-exec untuk bisa beralih user dengan aman
RUN apk --no-cache add su-exec

# Salin skrip entrypoint dan pastikan bisa dieksekusi
COPY dockerConfig/docker-entrypoint.sh /usr/local/bin/
COPY dockerConfig/cronjobs /etc/cron.d/automation-cron
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
RUN chmod 0644 /etc/cron.d/automation-cron

# Tetapkan entrypoint. Ini akan berjalan sebagai ROOT.
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# HAPUS ATAU BERI KOMENTAR BARIS INI
# USER node
# === AKHIR PERUBAHAN ===

EXPOSE $PORT

# CMD sekarang akan dieksekusi OLEH entrypoint, yang akan
# menjalankan perintah ini sebagai user 'node' via su-exec.
CMD ["./dockerConfig/run.sh"]

FROM dependencies AS build
RUN node ace build --production

FROM base AS production
ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0
COPY --chown=node:node ./package*.json ./
RUN npm ci --production
COPY --chown=node:node --from=build /home/node/app/build .
EXPOSE $PORT
CMD [ "dumb-init", "node", "server.js" ]
