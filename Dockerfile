FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN npm run build -- --webpack

EXPOSE 3000
LABEL com.docker.desktop.port="3000"

CMD ["npm", "run", "start"]
