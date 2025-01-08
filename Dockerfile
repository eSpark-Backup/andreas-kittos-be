FROM node:lts-alpine

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production=false --silent && mv node_modules ../

COPY . .
RUN npm run build

CMD ["npm", "run", "start:prod"]