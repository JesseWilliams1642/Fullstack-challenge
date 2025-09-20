FROM node:20-alpine

WORKDIR /app
COPY . .
RUN npm install

# Expose the port, taking it from docker-compose.yml
ARG BACKEND_PORT
ENV BACKEND_PORT=${BACKEND_PORT}
EXPOSE 5554 

# Run the server
CMD ["npm", "run", "start:dev"]
