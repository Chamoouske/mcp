FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN addgroup -g 1000 nonroot && adduser -D -u 1000 nonroot
USER nonroot

CMD ["npm", "start"]