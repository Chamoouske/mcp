FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN apk add --no-cache shadow docker-cli && \
    groupadd -r nonroot && useradd -r -g nonroot nonroot || true

COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]

USER nonroot

CMD ["npm", "start"]