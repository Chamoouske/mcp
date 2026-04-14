FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN apk add --no-cache shadow && \
    groupadd -r nonroot && useradd -r -g nonroot nonroot || true
USER nonroot

CMD ["npm", "start"]