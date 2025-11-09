# Use Node.js 18 LTS
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Create public directory for static files
RUN mkdir -p public && \
    cp index.html public/ && \
    cp style.css public/ && \
    cp carousel.js public/

# Expose port
EXPOSE 8080

# Set environment variable for port
ENV PORT=8080

# Start the application
CMD [ "node", "server.js" ]
