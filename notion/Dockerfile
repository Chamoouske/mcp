FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN addgroup nonroot || true
RUN adduser -D nonroot || true
USER nonroot

CMD ["npm", "start"]