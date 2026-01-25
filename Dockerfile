# Use the official Node.js 20 image.
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# The Next.js app runs on port 3000, so we expose it
EXPOSE 3000

# The command to start the development server
CMD ["npm", "run", "dev"]
