######################################################
# Stage 1: This build created a staging docker image
######################################################

# Pull the Node.js Docker image as a build stage
FROM node:16-alpine as build

# Set the working directory inside the container
WORKDIR /frontend

# A wildcard is used to ensure both package.json and lock file are copied
COPY package*.json ./
COPY yarn.lock ./

# From compose or build args
ARG REACT_APP_SERVER_API_VERSION
ARG REACT_APP_SERVER_PATH
ARG REACT_APP_SERVER_PORT
ARG REACT_APP_SERVER_PROTOCOL
ARG REACT_APP_SERVER_HOST
# Store arg as environment variable
ENV REACT_APP_SERVER_API_VERSION ${REACT_APP_SERVER_API_VERSION}
ENV REACT_APP_SERVER_PATH ${REACT_APP_SERVER_PATH}
ENV REACT_APP_SERVER_PORT ${REACT_APP_SERVER_PORT}
ENV REACT_APP_SERVER_PROTOCOL ${REACT_APP_SERVER_PROTOCOL}
ENV REACT_APP_SERVER_HOST ${REACT_APP_SERVER_HOST}

# Install packages only if 'package.json' or 'yarn.lock' changes
RUN yarn install --immutable --immutable-cache

# Copy source files
COPY . ./

# build app only if changes were made in source folder
RUN yarn build

# expose port for documentation purposes
EXPOSE 3000

######################################################
# Stage 2: This build takes the production build from staging build
######################################################

# Pull the official nginx:mainline-alpine base image
FROM nginx:mainline-alpine

# copies static resources from build stage
COPY --from=build /frontend/build /usr/share/nginx/html

# expose port for documentation purposes
EXPOSE 80
EXPOSE 443