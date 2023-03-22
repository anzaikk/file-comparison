FROM nginx
WORKDIR /usr/share/nginx/html
COPY ./dist .
COPY default.conf /etc/nginx/conf.d/default.conf