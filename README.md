# CMS Blog

[![Test](https://github.com/evanigwilo/cms-blog/actions/workflows/run-tests.yml/badge.svg)](https://github.com/evanigwilo/cms-blog/actions/workflows/run-tests.yml)<space><space>
[![TypeScript](https://img.shields.io/badge/--3178C6?logo=typescript&logoColor=ffffff)](https://www.typescriptlang.org)

**CMS Blog** is a basic version of a Distributed Content Management System (CMS) for a blogging site.

Users can can store, manage, and serve various types of content (primarily text and images).

This solution uses  `React.js` for the UI, `Styled-Components` for styling, `Node.js` runtime, `Express.js` for the API layer, with `Redis` for cache/session, `MongoDB` for data like images and posts, and `Nginx` as a reverse proxy.

You can explore the [REST API](https://petstore.swagger.io/?url=https://raw.githubusercontent.com/evanigwilo/cms-blog/main/backend/docs/api-definition.yml)


## Architecture

### High-level architecture

This is a high-level view of how the different containers interact with each other.

<p align="center">
  <img src="/resources/architecture.png" height="512px" alt="High-level Architecture"/>
</p>

---

## Design Notes
- A timeline/feed for viewing all posts
- Ability to create, edit, update and delete posts as a user
- Design and implemented object models for entities.
- Schema-based solution to efficiently stores and retrieves content
- Supports replication, sharding, connection pooling
- Caching mechanisms to improve response times
- User authentication and authorization using cookie session
- Test Driven Development (TDD)
- CI/CD with GitHub Actions
- Responsive web design
- Infinite scroll
- Easy-to-use UI
- [React context](https://react.dev/reference/react/useContext) for state management

## Screenshots

## <img src="/resources/capture/1.jpg" width="100%" height="512px"/>
## <img src="/resources/capture/2.jpg" width="100%" height="512px"/>
## <img src="/resources/capture/3.jpg" width="100%" height="512px"/>

### Technologies used

**Authentication/Authorization**:
- [Express session middleware](https://github.com/expressjs/session) HTTP server-side framework used to create and manage a session middleware.

**Storage**:
- [MongoDB](https://www.mongodb.com) open source NoSQL database management program that manages document-oriented information.
- [Redis](https://redis.io) in-memory data structure store, used as a distributed, in-memory key–value database, cache and message broker.

**CI/CD**:
- [GitHub Actions](https://docs.github.com/en/actions) continuous integration and continuous delivery (CI/CD) platform that allows you to automate your build, test, and deployment pipeline.

**Networking/Routing**:
- [Nginx](https://www.nginx.com) web server that can also be used as a reverse proxy, load balancer, mail proxy and HTTP cache

**Containers**:
- [Docker](https://www.docker.com) used to automate the deployment of applications in lightweight containers so that applications can work efficiently in different environments.

**Forms Validation**:
- [React Hook Form](https://react-hook-form.com) library that helps you validate forms in React.js.

**JavaScript library**:

- [React.js](https://react.dev) declarative, efficient, and flexible JavaScript library for building reusable UI components.
- [Styled-components](https://www.styled-components.com) use component-level styles in your applications by the leverage mixture of JavaScript and CSS using a technique called CSS-in-JS.

### API Routes

| Methods | Routes                     | Description                                              |
| ------- | -------------------------- | -------------------------------------------------------- |
| POST    | /user/authenticate         | Gets user attributes for the current authenticated user. |
| POST    | /user/register             | Registers and authenticates users.                       |
| POST    | /user/login                | Logs in and authenticates users.                         |
| POST    | /user/logout               | Logs out the current authenticated user.                 |
| POST    | /user/update-bio           | Updates the current user bio.                            |
| GET     | /user/{username}           | Get a user by username.                                  |
| POST    | /post                      | Gets paginated posts                                     |
| PUT     | /post/create               | Creates a post                                           |
| POST    | /post/{username}           | Gets a user posts                                        |
| DELETE  | /post/{postId}             | Delete post by id                                        |
| GET     | /image/{username}          | Gets a user profile image                                |
| GET     | /image/post/{postId}       | Gets a post image                                        |
| POST    | /image/post/{postId}       | Uploads post image                                       |
| POST    | /image                     | Uploads user profile                                     |

---

## Requirements

Before getting started, make sure you have the following requirements:

- [Docker](https://www.docker.com)
- [Docker Compose](https://docs.docker.com/compose/) (Supporting compose file version 3)
- A [bash](https://www.gnu.org/software/bash) compatible shell

### Run The Project

Follow these steps to get your development environment set up:

1. **Clone this repository** locally;

```bash
# Change to the desired directory
$ cd <desired-directory>

# Clone the repo
$ git clone https://github.com/evanigwilo/cms-blog.git

# Change to the project directory
$ cd cms-blog
```

2. Change environmental variables file name in both **backend** and **frontend** folder from `.env.example` to `.env`

3. At the root directory **cms-blog**, run the following command:

```bash
# Create external docker volume for the mongo development database
$ docker volume create cms-blog_mongo-db-dev

# Build and run in a development container environment
$ docker-compose --env-file ./backend/.env --env-file ./frontend/.env -p cms-blog-dev-stack -f ./backend/docker-compose.yml -f ./backend/docker-compose.dev.yml -f ./frontend/docker-compose.dev.yml up --build -d
```

5. The web-app will be running at http://localhost:80

## Useful commands

```bash
# Stops development containers and removes containers, networks and volumes
$ docker-compose --env-file ./backend/.env --env-file ./frontend/.env -p cms-blog-dev-stack -f ./backend/docker-compose.yml -f ./backend/docker-compose.dev.yml -f ./frontend/docker-compose.dev.yml up down --remove-orphans

# Show compose configurations
$ docker-compose --env-file ./backend/.env --env-file ./frontend/.env -p cms-blog-dev-stack -f ./backend/docker-compose.yml -f ./backend/docker-compose.dev.yml -f ./frontend/docker-compose.dev.yml config

# Build and run backend tests in a container environment
$ docker-compose --env-file ./backend/.env -p cms-blog-test-stack -f ./backend/docker-compose.yml -f ./backend/docker-compose.test.yml up --build -d

# View logs for backend tests
$ docker-compose --env-file ./backend/.env -p cms-blog-test-stack -f ./backend/docker-compose.yml -f ./backend/docker-compose.test.yml logs -f api-server

# Stops backend tests containers and removes containers, networks and volumes
$ docker-compose --env-file ./backend/.env -p cms-blog-test-stack -f ./backend/docker-compose.yml -f ./backend/docker-compose.test.yml down -v --remove-orphans
```

## References

> [MongoDB](https://www.mongodb.com/)

> [Diagrams.net](https://www.diagrams.net)

> [Achieving High Performance with PostgreSQL and Redis](https://medium.com/wultra-blog/achieving-high-performance-with-postgresql-and-redis-deddb7012b16)

> [Docker Healthcheck for your Node.js App](https://anthonymineo.com/docker-healthcheck-for-your-node-js-app)

> [Cache management with GitHub Actions](https://docs.docker.com/build/ci/github-actions/cache)

> [Swagger: API Documentation & Design Tools for Teams](https://swagger.io/specification/)