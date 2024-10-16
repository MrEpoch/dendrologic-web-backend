# Use official Node.js image as base
FROM node:21.7.3-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY next.config.mjs tsconfig.json ./
COPY tailwind.config.ts postcss.config.mjs ./

# Install dependencies

RUN npm install --arch=arm64 --platform=linux --libc=musl sharp

RUN npm install

# Copy the rest of the application

COPY . .

# Expose port 3752

EXPOSE 3752

RUN npm run build

# Run the Next.js application
CMD ["npm", "run", "start"]
