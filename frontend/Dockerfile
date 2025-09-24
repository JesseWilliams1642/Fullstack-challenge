FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .

# Build the frontend files
RUN npm run build
EXPOSE ${VITE_FRONTEND_PORT}

# Serve the build
CMD npm run dev -- --host