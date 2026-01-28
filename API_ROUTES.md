# BoltLink API Routes Documentation

## Overview

All API endpoints are prefixed with `/api` (base URL: `http://localhost:5000/api`)

**Required Header for Protected Routes:** `x-api-key: <your-api-key>`

---

## Authentication Routes

### POST `/api/auth/login`

- **Description:** Login with API key
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "apiKey": "string"
  }
  ```
- **Response:**
  ```json
  {
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "name": "string"
    }
  }
  ```

### GET `/api/auth/me`

- **Description:** Get current authenticated user
- **Auth Required:** Yes (x-api-key header)
- **Response:**
  ```json
  {
    "id": "string",
    "email": "string",
    "name": "string"
  }
  ```

---

## Statistics Routes

### GET `/api/stats/overview`

- **Description:** Get dashboard statistics overview
- **Auth Required:** Yes (x-api-key header)
- **Response:**
  ```json
  {
    "totalClicks": "number",
    "activeLinks": "number",
    "topRegion": "string",
    "trend": {
      "clicks": "number",
      "active": "number"
    },
    "points": [
      {
        "day": "string",
        "clicks": "number"
      }
    ]
  }
  ```

---

## System Health Routes

### GET `/api/system/health`

- **Description:** Get system health status for all services
- **Auth Required:** Yes (x-api-key header)
- **Response:**
  ```json
  [
    {
      "service": "string",
      "status": "healthy|warning|error",
      "uptime": "string",
      "lastCheck": "ISO 8601 datetime"
    }
  ]
  ```

---

## Developer Settings Routes

### GET `/api/settings/developer`

- **Description:** Get developer settings
- **Auth Required:** Yes (x-api-key header)
- **Response:**
  ```json
  {
    "apiKey": "string (hidden)",
    "webhookUrl": "string",
    "rateLimitPerMin": "number",
    "rateLimitPerHour": "number",
    "logsEnabled": "boolean",
    "analyticsLevel": "string"
  }
  ```

### PATCH `/api/settings/developer/webhook`

- **Description:** Update webhook URL
- **Auth Required:** Yes (x-api-key header)
- **Request Body:**
  ```json
  {
    "url": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": "boolean",
    "message": "string",
    "webhookUrl": "string"
  }
  ```

---

## Link Management Routes

### POST `/api/shorten`

- **Description:** Create a shortened URL with optional settings
- **Auth Required:** Yes (x-api-key header)
- **Rate Limit:** Yes (shortenLimiter)
- **Request Body:**
  ```json
  {
    "url": "string",
    "isProtected": "boolean (optional)",
    "password": "string (required if isProtected=true)",
    "isExpiring": "boolean (optional)",
    "expiresAt": "ISO 8601 datetime (required if isExpiring=true)",
    "isRateLimited": "boolean (optional)",
    "maxClicksPerMin": "number (optional)"
  }
  ```
- **Response:** ShortLink object

### GET `/api/links`

- **Description:** Get all shortened links for authenticated user
- **Auth Required:** Yes (x-api-key header)
- **Response:** Array of ShortLink objects

### GET `/api/links/:id`

- **Description:** Get a specific link by ID
- **Auth Required:** Yes (x-api-key header)
- **Response:** ShortLink object

### PATCH `/api/links/:id`

- **Description:** Update a specific link
- **Auth Required:** Yes (x-api-key header)
- **Request Body:** Partial ShortLink object
- **Response:** Updated ShortLink object

### DELETE `/api/links/:id`

- **Description:** Delete a specific link
- **Auth Required:** Yes (x-api-key header)
- **Response:** Success message

### GET `/api/top-links?limit=10`

- **Description:** Get top performing links
- **Auth Required:** No
- **Query Parameters:**
  - `limit` (optional, default: 10): Number of top links to return
- **Response:** Array of ShortLink objects

---

## Analytics Routes

### GET `/api/analytics/:code`

- **Description:** Get analytics for a specific shortened link
- **Auth Required:** Yes (x-api-key header)
- **Path Parameters:**
  - `code`: The short code of the link
- **Response:** AnalyticsResponse object

### GET `/api/analytics/global`

- **Description:** Get global analytics across all links
- **Auth Required:** Yes (x-api-key header)
- **Response:**
  ```json
  {
    "globalClicks": "number",
    "totalLinks": "number",
    "averageClicksPerLink": "number",
    "topCountries": ["string"],
    "lastUpdated": "ISO 8601 datetime"
  }
  ```

---

## Metadata Routes

### POST `/api/metadata`

- **Description:** Scrape metadata from a URL
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "url": "string"
  }
  ```
- **Response:** Metadata object (title, description, image, etc.)

---

## Rate Limit Routes

### GET `/api/rate-limit-status/:code`

- **Description:** Get rate limit status for a specific link
- **Auth Required:** No
- **Path Parameters:**
  - `code`: The short code of the link
- **Response:** Rate limit status object

---

## Key Management Routes

### POST `/api/generate-key`

- **Description:** Generate a new API key
- **Auth Required:** No
- **Response:**
  ```json
  {
    "apiKey": "string"
  }
  ```

---

## Redirect Route (Non-API)

### GET `/:code`

- **Description:** Redirect to the original URL
- **Auth Required:** No
- **Rate Limit:** Yes (redirectLimiter)
- **Path Parameters:**
  - `code`: The short code of the link
- **Response:** HTTP 301/302 redirect to original URL

---

## CORS Configuration

The backend is configured to accept requests from all origins with the following:

- **Allowed Methods:** GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Allowed Headers:** Content-Type, Authorization, x-api-key
- **Credentials:** Allowed

---

## Fixed Issues

1. ✅ Added missing `/api/auth/login` endpoint
2. ✅ Added missing `/api/auth/me` endpoint
3. ✅ Added missing `/api/stats/overview` endpoint
4. ✅ Added missing `/api/system/health` endpoint
5. ✅ Added missing `/api/settings/developer` endpoint
6. ✅ Added missing `/api/settings/developer/webhook` endpoint
7. ✅ Added missing `/api/analytics/global` endpoint
8. ✅ Updated CORS configuration to allow `x-api-key` header
9. ✅ Updated frontend API service to properly handle API key initialization
10. ✅ Added proper error handling and network error detection

---

## Frontend-Backend Communication Flow

1. **Initialization**: Frontend calls `/api/generate-key` to create or retrieve API key
2. **Storage**: API key is stored in localStorage
3. **Requests**: All subsequent requests include `x-api-key` header
4. **Auth**: Backend validates API key in middleware
5. **Response**: Backend returns data or 401 error if key is invalid
