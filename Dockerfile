From node:13-slim

WORKDIR /app
 
ADD . /app

CMD node src/index.js
