# build stage
FROM node:18.17.1-alpine AS builder

WORKDIR /app

COPY package*.json ./

# RUN npm install
RUN npm install -g npm-check-updates && \
    ncu -u && \
    npm install

COPY . .

RUN npm run build

# prod stage

FROM node:18.17.1-alpine

RUN apk update && \
    apk add --no-cache nginx

WORKDIR /app

ENV NODE_ENV=production

COPY default.conf /etc/nginx/http.d/default.conf
COPY ./run.sh ./run.sh
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

CMD ["sh", "run.sh"]
