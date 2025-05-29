## Share your travels - REST API
> You can find the frontend for this project [HERE](https://github.com/esterhugosson/Shareyourtravels-frontend?tab=readme-ov-file)
---

### Table of Contents

1. [About the Project](#about-the-project)
2. [Deployed Version](#deployed-version)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Setup Logs Folder](#setup-logs-folder)
8. [Running the Server](#running-the-server)
9. [API Documentation](#api-documentation)
10. [Running Tests](#running-tests)
11. [Linting](#linting)
12. [Folder Structure](#folder-structure)
13. [Contributing](#contributing)
14. [Known Issues & Future Improvements](#known-issues--future-improvements)
15. [License](#license)

---

### About the Project

"Share your travels" is a RESTful API backend for a web app where users can log and share travel experiences, including destinations, places, and ratings. It includes authentication, public/private travel logs, and detailed geolocation support.

---

### Deployed Version

You can access the deployed API here (version 1):

[https://cscloud7-102.lnu.se/backend-project/api/v1](https://cscloud7-102.lnu.se/backend-project/api/v1)


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
git clone git@github.com:esterhugosson/Shareyoutravels-backend.git
cd BACKEND
npm install
```

---

#### Environment Variables

Add a `.env`, with following variables:

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

#### Setup Logs Folder

Before starting the server, make sure the following folder and files exist:
```bash
mkdir logs
touch logs/combined.log logs/error.log logs/exception.log
```
Otherwise, logging will fail when the application tries to write log entries.


#### Running the Server

```bash
npm run dev
```

---

### API Documentation

Read about all endpoints here -> [API Documentation](./ENDPOINTS.md)


Or on postman: [API Documentation (Postman Collection)](./Share%20your%20travels%20API.postman_collection.json)

---

### 🧪 Running Tests

```bash
npm run test
```

There are ~30 automated tests using `supertest` and `jest`.

#### Tests include:
- Authentication flow (register/login/refresh)
- Travel CRUD operations
- Place CRUD within travels
- Validation and error handling

You can also test the endpoint in postman.

1. Import the postman collection [this](./Share%20your%20travels%20API.postman_collection.json)
2. Run the tests by pressing Run in the main folder

---

### Linting

This project uses the ESLint, to run, run the following command:

```bash
npm run lint
```
You can configure rules in .eslintrc.json. Use npm run lint:fix to auto-fix common issues.

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

### Known Issues & Future Improvements
 
 - Handle edge cases for invalid coordinates
 - Improve error messages for validation
 - Add Swagger/OpenAPI documentation
 - Add role-based access control
 - Optimize MongoDB queries for large datasets
 
 If you find a bug or something isn't working, feel free to create an issue or submit a pull request!



### 🪪 License

This project is under the MIT license, you can read about it here [LICENSE](./LICENSE.txt).


