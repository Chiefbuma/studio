# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to leverage Docker's caching.
COPY package.json ./
COPY package-lock.json* ./

# Install project dependencies.
RUN npm install

# Copy the rest of the application's source code into the container.
COPY . .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define the command to run your app in development mode with hot-reloading.
CMD ["npm", "run", "dev"]
