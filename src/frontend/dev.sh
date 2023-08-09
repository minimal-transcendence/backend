# !/bin/sh

echo "install nginx ...!"
apk update && apk add nginx
cp /app/default.conf /etc/nginx/http.d/default.conf

echo "Nginx Started..." && \
nginx

npm run dev
