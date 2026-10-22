# News & Updates API

A RESTful API built with **Node.js, Hapi.js, and PostgreSQL** for managing news articles and categories. The project follows a layered architecture that separates routes, controllers, business logic, validation, and database operations.

## Features

- Create, retrieve, update, and delete news articles.
- Manage news categories.
- Validate incoming requests using Joi.
- Store data in PostgreSQL.
- Implement soft deletion for news articles.
- Organize code into repository, service, controller, and route layers.
- Provide environment-based configuration.
- Return structured API responses and appropriate HTTP status codes.

## Technology Stack

- Node.js
- Hapi.js
- PostgreSQL
- `pg` PostgreSQL client
- Joi validation
- dotenv for environment configuration

## Project Structure

```text
news-client-api/
├── src/
│   ├── database/
│   │   ├── migrations/
│   │   ├── connection.js
│   │   └── test-connection.js
│   ├── modules/
│   │   ├── categories/
│   │   └── news/
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js and npm
- PostgreSQL
- Git

## Installation

Clone the public repository:

```bash
git clone https://github.com/CodeAlchemist79/news-client-api.git
cd news-client-api
npm install
```

## Environment Configuration

Create a local `.env` file by copying the example:

**PowerShell:**

```powershell
Copy-Item .env.example .env
```

Open `.env` and enter your own PostgreSQL connection details. Use the variable names already defined in `.env.example`.

Never commit your real database password or other secrets.

## Database Setup

1. Create a PostgreSQL database for the project.
2. Configure the database credentials in `.env`.
3. Run the SQL migration files in `src/database/migrations/` in numerical order using your PostgreSQL client.
4. Confirm that the database tables were created successfully.

The migrations define the database schema and include changes for news soft deletion and removal of the clients table.

## Running the API

Start the development server:

```bash
npm run dev
```

Or start the application normally:

```bash
npm start
```

The default local server address is:

```text
http://localhost:3000
```

Check the health endpoint:

```text
GET http://localhost:3000/api/v1/health
```

The health endpoint reports the API status and database connectivity.

## API Endpoints

All endpoints use the `/api/v1` prefix.

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/health` | Check API and database connectivity |

### Categories

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/categories` | List categories |
| GET | `/api/v1/categories/{id}` | Retrieve a category |
| POST | `/api/v1/categories` | Create a category |
| PUT | `/api/v1/categories/{id}` | Update a category |
| DELETE | `/api/v1/categories/{id}` | Delete a category |

### News

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/news` | List news articles |
| GET | `/api/v1/news/deleted` | List soft-deleted articles |
| GET | `/api/v1/news/{id}` | Retrieve a news article |
| POST | `/api/v1/news` | Create a news article |
| PUT | `/api/v1/news/{id}` | Update a news article |
| DELETE | `/api/v1/news/{id}` | Soft-delete a news article |
| PATCH | `/api/v1/news/{id}/restore` | Restore a soft-deleted article |

Use JSON request bodies for create and update operations. The validation schemas in the source code define the required fields and accepted values.

## Soft Deletion

News articles support soft deletion through the `deleted_at` timestamp column. The delete endpoint marks an article as deleted rather than immediately removing its database record. The deleted-news endpoint lists deleted articles, and the restore endpoint provides a way to request restoration.

## Architecture

The application uses a layered design:

- **Routes:** Define API endpoints.
- **Controllers:** Handle incoming requests and responses.
- **Services:** Contain business logic.
- **Repositories:** Execute database operations.
- **Validation:** Validate incoming request data.
- **Database layer:** Manage PostgreSQL connectivity and migrations.

This separation improves maintainability, testability, and code organization.
## Architecture

The application uses a layered design:

- **Routes:** Define API endpoints.
- **Controllers:** Handle incoming requests and responses.
- **Services:** Contain business logic.
- **Repositories:** Execute database operations.
- **Validation:** Validate incoming request data.
- **Database layer:** Manage PostgreSQL connectivity and migrations.

This separation improves maintainability, testability, and code organization.

## Security Notes

- Keep `.env` out of version control.
- Use placeholder values in `.env.example`.
- Do not publish real passwords, tokens, or production credentials.
- Configure appropriate database permissions before deployment.

## Author

**Malon Kipkogei**

GitHub: [CodeAlchemist79](https://github.com/CodeAlchemist79)

## License

No license has been specified yet. All rights are reserved by default unless a license is added to the repository.
