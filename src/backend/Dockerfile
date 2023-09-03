####################
#	build stage
####################

FROM node:18.17.1-alpine AS builder

WORKDIR /app

COPY package*.json ./

# RUN npm install

RUN npm install -g npm-check-updates && \
    ncu -u && \
    npm install

COPY . .
COPY *.png /photo/

## prisma
RUN npx prisma generate

RUN npm run build

####################
# production stage
####################

FROM node:18.17.1-alpine

WORKDIR /app

ARG NODE_ENV=production

ENV NODE_ENV=${NODE_ENV}

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json .
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/*.png /photo/

RUN npm install --only-production

RUN npm install -g npm-check-updates && \
    ncu -u && \
    npm install --only-production

# prisma
COPY ./prisma ./prisma

CMD ["npm", "run", "start:migrate:prod"]

#----------------------------------------#

# # dev stage
# FROM node:18-alpine

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# # CMD ["npm", "run", "start:migrate:dev"]
# CMD ["tail", "-f", "/dev/null"]
