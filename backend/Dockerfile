# Pull the Node.js Docker image
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /backend

# A wildcard is used to ensure both package.json and package-lock.json are copied
COPY package*.json ./
COPY yarn.lock ./

# From compose or build args
ARG NODE_ENV 
# Store arg as environment variable
ENV NODE_ENV ${NODE_ENV}

RUN yarn install --immutable --immutable-cache

# Copy source files
COPY . ./
# Copy the sample environmental variables file
COPY .env.example ./.env

# expose port for documentation purposes
EXPOSE 4000

CMD yarn "$(if [ "$NODE_ENV" == "development" ]; \
    then echo "development"; \
    else echo "test"; \
    fi)"