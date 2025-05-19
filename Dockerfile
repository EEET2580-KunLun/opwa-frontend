FROM node:20-alpine AS build

WORKDIR /app
RUN apk add openssl

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir ssl && \
    openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout ssl/key.pem -out ssl/cert.pem \
    -subj "/CN=localhost" -days 365

ENV NODE_ENV=development
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY /src/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/ssl /etc/nginx/ssl

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
