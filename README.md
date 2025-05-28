## Share your travels - api

> This is the backend api for the website share your travels. 

---

### Table of Contents

1. [About the Project](#about-the-project)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [API Documentation](#api-documentation)
6. [Environment Variables](#environment-variables)
7. [Running Tests](#running-tests)
8. [Folder Structure](#folder-structure)
9. [Contributing](#contributing)
10. [License](#license)

---

### About the Project


---

### Features

* JWT-based authentication
* CRUD for users, travels, and places
* Input validation
* MongoDB integration with Mongoose
* Jest-based testing

---

### Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB + Mongoose**
* **Jest** for testing
* **dotenv** for environment configs
* **Postman** for testing/documentation

---

### Getting Started

#### Prerequisites

* Node.js (v18+)
* npm 
* MongoDB running locally

#### Installation

```bash
git clone git@gitlab.lnu.se:1dv613/student/eh225bx/projects/backend-project.git
cd BACKEND
npm install
```

#### Running the Server

```bash
npm run dev
```

---
ADD DOC ABOUT LOGS
ADD DOC ABOUT BUGS EN FUTURE IMPROVMENTS
### API Documentation

Read about all endponints here -> [API Documentation](./ENDPOINTS.md)


Link: [API Documentation (Postman Collection)](.)

---

### Environment Variables

List the required environment variables in `.env`, for example:

```
PORT=3000
DB_CONNECTION_STRING=mongodb://localhost:27017/your_database_name
BASE_URL="/"

ACCESS_TOKEN_SECRET=your_access_token_secret_key
ACCESS_TOKEN_LIFE=2h

REFRESH_TOKEN_SECRET=your_refresh_token_secret_key
REFRESH_TOKEN_LIFE=30d

LOG_LEVEL=http

# Log file locations
LOGGER_COMBINED_LOG_FILE=logs/combined.log
LOGGER_ERROR_LOG_FILE=logs/error.log
LOGGER_UNCAUGHT_EXCEPTION_LOG_FILE=logs/exception.log

# MongoDB logging
LOGGER_DB_CONNECTION_STRING=mongodb://localhost:55000/logs
LOGGER_DB_COLLECTION_NAME=logs

# Whether to include remote address in Morgan logs
LOGGER_MORGAN_FORMAT_ADD_REMOTE=false
```

---

### 🧪 Running Tests

```bash
npm run test
```

There is ca 30 automatic tests using `supertest` and `jest`.

---

### Folder Structure

```bash
.
src
├── config/
├── controllers/
├── lib/
├── middleware/
├── models/
├── routes/
├── tests/
├── utils/
├── app.js
└── server.js
```

---

### Contributing

* Fork the repo
* Create a new branch
* Make changes
* Open a pull request

---

### 🪪 License

This project is under the MIT license, you can read about it here [LICENSE](./LICENSE.txt).


