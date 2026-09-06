FROM node:18-alpine AS build
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy built dist folder
COPY dist ./dist


# Start the application
CMD ["node", "dist/server/server.mjs"] 
