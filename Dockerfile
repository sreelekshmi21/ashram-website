FROM node:20-alpine

WORKDIR /app

# Install build dependencies required by native C++ modules (bcrypt)
RUN apk add --no-cache \
    python3 \
    make \
    g++

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "start"]