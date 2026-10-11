# QuickNotes API design

The QuickNotes API is a JSON REST API for authenticated users to create, read,
update, and organize personal notes. All paths are versioned under `/api/v1`,
and JSON requests must include `Content-Type: application/json`. Protected
endpoints require an access token in the `Authorization` header:

```http
Authorization: Bearer <access-token>
```

## Endpoint reference

| Method | Path | Description | Success status |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/login` | Authenticate a user and issue an access token. | `200 OK` |
| `POST` | `/api/v1/auth/register` | Create a user account. | `201 Created` |
| `GET` | `/api/v1/notes` | List the authenticated user's notes, with pagination and optional search. | `200 OK` |
| `POST` | `/api/v1/notes` | Create a note for the authenticated user. | `201 Created` |
| `GET` | `/api/v1/notes/{noteId}` | Return one note owned by the authenticated user. | `200 OK` |
| `PATCH` | `/api/v1/notes/{noteId}` | Update selected fields on an existing note. | `200 OK` |
| `DELETE` | `/api/v1/notes/{noteId}` | Permanently delete a note. | `204 No Content` |
| `GET` | `/api/v1/tags` | List tags available to the authenticated user. | `200 OK` |
| `POST` | `/api/v1/notes/{noteId}/tags/{tagId}` | Associate an existing tag with a note. | `204 No Content` |

### `GET /api/v1/notes`

The list endpoint returns the user's notes newest first by default. Clients can
use `page`, `pageSize` (maximum 100), and `q` for pagination and title/body
search.

Example request:

```http
GET /api/v1/notes?page=1&pageSize=20&q=launch HTTP/1.1
Host: api.quicknotes.example
Authorization: Bearer <access-token>
Accept: application/json
```

Example response (`200 OK`):

```json
{
  "data": [
    {
      "id": "note_01HV7W4M8V5R3P6Q2A1B9C0D1E",
      "title": "Launch checklist",
      "body": "Confirm the release notes and backup.",
      "userId": "user_123",
      "tags": ["work", "release"],
      "createdAt": "2026-10-11T09:15:00Z",
      "updatedAt": "2026-10-11T09:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

### `POST /api/v1/notes`

The title is required and may contain at most 100 characters. The body is
optional and may contain at most 10,000 characters. The server assigns the
note ID and timestamps; clients must not send those fields.

Example request:

```http
POST /api/v1/notes HTTP/1.1
Host: api.quicknotes.example
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "title": "Shopping list",
  "body": "Coffee, fruit, and bread."
}
```

Example response (`201 Created`):

```json
{
  "data": {
    "id": "note_01HV7W8K2J4N6M9P3Q5R7S1T2U",
    "title": "Shopping list",
    "body": "Coffee, fruit, and bread.",
    "userId": "user_123",
    "tags": [],
    "createdAt": "2026-10-11T10:00:00Z",
    "updatedAt": "2026-10-11T10:00:00Z"
  }
}
```

The `Location` response header points to
`/api/v1/notes/note_01HV7W8K2J4N6M9P3Q5R7S1T2U`.

### `GET /api/v1/notes/{noteId}`

Returns the complete note resource (`200 OK`). A note owned by another user is
reported as `404 Not Found` rather than revealing that it exists.

### `PATCH /api/v1/notes/{noteId}`

Updates one or both editable fields, `title` and `body`. The response contains
the updated note (`200 OK`). The operation is idempotent for the same resource
state.

### `DELETE /api/v1/notes/{noteId}`

Deletes the note and its note-tag associations. A successful response has no
body and returns `204 No Content`. Repeating the delete for a missing or
inaccessible note returns `404 Not Found`.

## Error responses

Errors use a consistent JSON envelope. The `requestId` lets support staff trace
the failed request without exposing internal details.

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The title is required.",
    "details": [
      {
        "field": "title",
        "issue": "required"
      }
    ]
  },
  "requestId": "req_01HV7XQ4Y6Z8A2B3C4D5E6F7G8"
}
```

The API can return these status codes:

| Status | Meaning | Typical cause |
| --- | --- | --- |
| `400 Bad Request` | The request is malformed or fails validation. | Missing title, invalid JSON, or an invalid query parameter. |
| `401 Unauthorized` | Authentication is missing or invalid. | Missing, expired, or malformed bearer token. |
| `403 Forbidden` | The identity is valid but not allowed to perform the action. | Attempting an administrator-only operation without permission. |
| `404 Not Found` | The requested resource does not exist or is not visible to the user. | Unknown `noteId` or `tagId`. |
| `409 Conflict` | The request conflicts with current resource state. | Duplicate email during registration. |
| `429 Too Many Requests` | The client exceeded a rate limit. | Too many requests from one token or IP address. |
| `500 Internal Server Error` | An unexpected server failure occurred. | Database or unhandled application failure. |

For `500` responses, the message remains generic and never includes stack
traces or database details. Clients should display a friendly retry message and
include the `requestId` when reporting the problem.
