FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+), and we also copy the yarn lock file to support both yarn and npm
COPY package*.json ./
COPY yarn.lock ./

# We use Yarn in this code base
RUN yarn install

# Bundle app source
COPY . .

# Expose the react-app-rewired ports
EXPOSE 3000

# Don't start the server, docker-compose will
