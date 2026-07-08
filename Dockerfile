# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci || npm install

# Copy the rest of the application files
COPY . .

# Run the full-stack build (Vite static assets + esbuild server compilation)
RUN npm run build

# --- Stage 2: Production Runner Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

# Define production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Copy package manifests for installing production-only dependencies
COPY package.json package-lock.json* ./

# Install production dependencies only to keep the final image minimal and secure
RUN npm ci --only=production || npm install --only=production

# Copy compiled files from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the production port
EXPOSE 3000

# Start the Express production server
CMD ["npm", "start"]
