# Use the official Node.js 20 image as a base
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
# Using a wildcard to handle both npm and yarn lockfiles
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code into the container
# The .dockerignore file will prevent node_modules from being copied
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# The command to start the Next.js development server
CMD ["npm", "run", "dev"]
