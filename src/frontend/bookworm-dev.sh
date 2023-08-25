# !/bin/sh

echo "install nginx ...!"
# apk update && apk add nginx && npm install next
apt-get update && apt-get upgrade && apt-get install -y nginx && npm install next
cp /app/default.conf /etc/nginx/site-available/default

echo "Nginx Started..." && \
nginx

npm run dev
