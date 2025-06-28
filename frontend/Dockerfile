# Stage 1: Build React app with backend URL
FROM node:24-alpine AS build

WORKDIR /app

# Accept build-time backend URL
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}

COPY package*.json ./
RUN npm install

COPY . .

# This uses the REACT_APP_BACKEND_URL when building
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:stable-alpine

# Copy build output
COPY --from=build /app/build /usr/share/nginx/html

# Optional: for React Router
# COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
