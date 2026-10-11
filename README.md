# QuickNotes

QuickNotes is a browser-based notes client backed by the JSONPlaceholder
practice API. It demonstrates loading notes with `GET`, creating notes with
`POST`, and deleting notes with `DELETE`. The project also includes the
backend design documents for turning the client into a production service for
1 million users.

## Run the API client

The client is made of plain HTML, CSS, and JavaScript, so no package
installation is required. Serve the project directory with any local static
HTTP server, then open the displayed URL:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in a browser.

The client uses the public
[JSONPlaceholder posts API](https://jsonplaceholder.typicode.com/posts).
JSONPlaceholder simulates writes, so created and deleted notes are not
persisted after the page is reloaded.

## Project files

- [index.html](./index.html) - QuickNotes page structure and note form
- [api.js](./api.js) - API requests, validation, rendering, and request states
- [style.css](./style.css) - Responsive application styling

## Design documents

- [API design](./docs/api-design.md) - REST endpoints, payloads, and errors
- [Data model](./docs/data-model.md) - SQL entities, relationships, and queries
- [Architecture](./docs/architecture.md) - Scalable service architecture,
  estimates, flows, and trade-offs

## What I learned

- A reusable request helper can centralize HTTP error handling while each
  operation remains responsible for its own loading, success, and error UI.
- Rendering user-controlled values with `textContent` instead of HTML strings
  prevents injected text from becoming executable markup.
- Relational modeling is a strong fit for QuickNotes because foreign keys,
  transactions, joins, and indexes protect ownership and tagging relationships.
- Stateless application servers, caching, read replicas, and durable queues
  provide separate ways to improve performance and reliability as usage grows.
