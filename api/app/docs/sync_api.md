# Sync API Documentation

This document provides details on how to use the Sync API for frontend developers.

## Base URL

All API endpoints are prefixed with `/app/index.php/LocalApi/sync/`.

## Endpoints

### GET /

Returns basic debug information about the server.

**Response Example:**
```json
{
  "php_version": "7.4.26",
  "server_software": "Apache/2.4.51",
  "message": "Welcome to the Sync API"
}
```

### GET /tables

Returns a list of all available tables that can be synced.

**Response Example:**
```json
{
  "tables": ["users", "products", "orders", "categories"]
}
```

### GET /table/{table_name}

Retrieves data from a specific table with pagination.

**URL Parameters:**
- `table_name` (required): Name of the table to fetch data from

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `per_page` (optional): Number of records per page (default: 20)

**Example Request:**
```
GET http://localhost:8807/app/index.php/LocalApi/sync/table/users?page=2&per_page=10
```

**Response Structure:**
The response structure will depend on the table, but will include pagination metadata and the records.

### GET /structure/{table_name}

Returns the structure (columns and their types) for a specific table.

**URL Parameters:**
- `table_name` (required): Name of the table to get structure for

**Example Request:**
```
GET http://localhost:8807/app/index.php/LocalApi/sync/structure/users
```

**Response Example:**
```json
{
  "columns": [
    {
      "name": "id",
      "type": "int",
      "primary_key": true
    },
    {
      "name": "username",
      "type": "varchar"
    },
    {
      "name": "email",
      "type": "varchar"
    }
  ]
}
```

### GET /all

Syncs all tables at once with pagination.

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `per_page` (optional): Number of records per page (default: 20)

**Example Request:**
```
GET http://localhost:8807/app/index.php/LocalApi/sync/all?page=1&per_page=50
```

**Response Structure:**
The response will include data from all tables with pagination metadata.

## Error Handling

All API endpoints return JSON responses with appropriate HTTP status codes:
- 200: Success
- 500: Server error

Error responses will include an error message:

```json
{
  "error": "Table 'unknown_table' does not exist"
}
```

## Usage Examples

### Using the fetchApi function

The application provides a utility function called `fetchApi` in `js/exe.js` which should be used for all API calls. This function handles authentication and error handling automatically.

```javascript
// API endpoint paths
const API_ENDPOINTS = {
  TABLES: "sync/tables",
  TABLE: "sync/table",
  STRUCTURE: "sync/structure",
  ALL: "sync/all",
  SEND: "sync/send"
};

// Get list of available tables
const tablesResult = fetchApi(API_ENDPOINTS.TABLES, "GET");
if (tablesResult && tablesResult.tables) {
  console.log(tablesResult.tables);
}

// Get data from a specific table with pagination
const tableData = fetchApi(`${API_ENDPOINTS.TABLE}/users?page=1&per_page=20`, "GET");
if (tableData && tableData.data) {
  // Process the data
  console.log(tableData.data);
}

// Send data to the server
const sendResult = fetchApi(API_ENDPOINTS.SEND, "POST", {
  table: "users",
  page: 1,
  records: [/* data */]
});
if (sendResult && sendResult.success) {
  console.log("Data sent successfully");
}
```

### JavaScript Fetch API Example (Alternative)

If you need to use the native fetch API instead of the provided `fetchApi` function, you can do so as follows:

```javascript
// Base URL
const API_BASE_URL = "http://localhost:8807/app/index.php/LocalApi/sync";

// Get list of available tables
fetch(`${API_BASE_URL}/tables`)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### Axios Example (Alternative)

```javascript
// Base URL constant
const API_BASE_URL = "http://localhost:8807/app/index.php/LocalApi/sync";

// Get table structure
axios.get(`${API_BASE_URL}/structure/users`)
  .then(response => {
    // Process the structure
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error fetching structure:', error);
  });
``` 