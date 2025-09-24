FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm i                  
COPY . .

# Expose the port, taking it from docker-compose.yml
EXPOSE ${BACKEND_PORT}

# Run the server
CMD npm run start:dev
