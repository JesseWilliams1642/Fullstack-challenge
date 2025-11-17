FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm i                  
COPY . .

# Install curl for health check
RUN apk add --no-cache curl

# Expose the port, taking it from docker-compose.yml
EXPOSE ${BACKEND_PORT}

# Run the server
CMD npm run start:dev

# Health check for frontend to wait
HEALTHCHECK CMD curl -f http://localhost:${BACKEND_PORT}/api/health || exit 1