# syntax=docker/dockerfile:1
ARG NODE_IMAGE=node:18.20.4-alpine3.20

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

ENV PORT=3333
ENV HOST=0.0.0.0

EXPOSE $PORT

CMD ["npm", "run", "dev"]

# FROM dependencies AS build
# RUN node ace build --production

# FROM base AS production
# ENV NODE_ENV=production
# ENV PORT=4444
# ENV HOST=0.0.0.0
# COPY --chown=node:node ./package*.json ./
# RUN npm ci --production
# COPY --chown=node:node --from=build /home/node/app/build .
# EXPOSE $PORT
# CMD [ "dumb-init", "node", "server.js" ]
