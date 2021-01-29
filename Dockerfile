FROM node:8.9.4
COPY . /app
WORKDIR /app
RUN npm install
EXPOSE 3000
CMD node server.js