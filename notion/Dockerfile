FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build

ENV NOTION_API_KEY=

EXPOSE 3001

CMD ["npm", "start"]