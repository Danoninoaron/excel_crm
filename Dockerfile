FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --ignore-scripts
COPY . .
RUN npx prisma generate && npx next build
RUN mkdir -p /app/data
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:/app/data/fdp.db"
EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/prisma db push --accept-data-loss && node_modules/.bin/next start"]
