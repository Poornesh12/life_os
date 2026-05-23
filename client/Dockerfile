# Stage 1: Base image
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Stage 2: Development environment
FROM base AS development
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 3: Build application
FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

# Stage 4: Production serving with Nginx
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
