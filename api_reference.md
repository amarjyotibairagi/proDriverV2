# API Reference

This document tracks all API endpoints interacting with the frontend, extracted from the `reference_only` project. Use this to plan the backend database schema.

## Authentications

### `POST /api/auth/login`
- **Purpose**: Authenticate user.
- **Payload**:
  ```json
  {
    "employeeId": "string",
    "password": "string",
    "language": "string" // e.g., "en"
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "id": "string",
      "name": "string",
      "role": "USER | ADMIN | SUPER_ADMIN",
      ...
    },
    "token": "string"
  }
  ```

### `POST /api/auth/register`
- **Purpose**: Register a new user.
- **Payload**:
  ```json
  {
    "name": "string",
    "employeeId": "string",
    "password": "string",
    "mobile": "string",
    "company": "string",
    "designation": "string",
    "depot": "string"
  }
  ```
- **Response**: Success/Failure message.

### `POST /api/auth/logout`
- **Purpose**: Log out the current session.

### `POST /api/auth/change-password`
- **Purpose**: Change user password.
- **Payload**:
  ```json
  {
    "oldPassword": "string",
    "newPassword": "string"
  }
  ```

## System

### `GET /api/system/options`
- **Purpose**: Fetch dynamic dropdown options for registration.
- **Response**:
  ```json
  {
    "depots": ["string"],
    "designations": ["string"]
  }
  ```

## Driver / User Dashboard

### `GET /api/driver/me`
- **Purpose**: Fetch current user profile and session data.

### `GET /api/driver/settings`
- **Purpose**: Fetch user specific settings.

### `GET /api/progress`
- **Purpose**: Fetch training progress for the user.

## Admin Dashboard

### `GET /api/admin/users`
- **Purpose**: List all registered users.

### `GET /api/admin/modules`
- **Purpose**: List all training modules.

### `GET /api/admin/master-data`
- **Purpose**: Fetch master data for admin management.

### `DELETE /api/admin/master-data`
- **Purpose**: Delete master data item.
- **Query Params**: `?type={type}&id={id}`
