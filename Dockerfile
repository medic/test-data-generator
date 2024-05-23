FROM node:20-slim

RUN apt update && apt install --no-install-recommends -y build-essential

# Using the 1000:1000 user is recommended for VSCode dev containers
# https://code.visualstudio.com/remote/advancedcontainers/add-nonroot-user
USER node

WORKDIR /workdir

COPY . .

RUN npm install -g

ENTRYPOINT ["test-data-generator"]
