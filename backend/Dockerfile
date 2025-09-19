FROM node:20-alpine

WORKDIR /app
COPY . .
RUN npm install

# Expose the port
EXPOSE 5554 

# Run the server
CMD ["npm", "run", "start:dev"]
