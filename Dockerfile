FROM node:20-slim

RUN apt update && apt install --no-install-recommends -y build-essential

WORKDIR /app

COPY . .

RUN npm ci

# Using the 1000:1000 user is recommended for VSCode dev containers
# https://code.visualstudio.com/remote/advancedcontainers/add-nonroot-user
USER node

ARG INSTANCE_COUCH_URL
ENV COUCH_URL=INSTANCE_COUCH_URL

VOLUME /app/test-data
ARG FILE
ENTRYPOINT ["npm", "run", "generate", "test-data/$FILE"]
