const API_URL = "https://jsonplaceholder.typicode.com/posts";

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

function setStatus(message, state = "") {
  const status = document.querySelector("#status");
  status.textContent = message;
  status.className = state;
}

function renderNotes(notes) {
  const notesList = document.querySelector("#notes-list");
  notesList.replaceChildren();

  if (notes.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "No notes found.";
    notesList.append(emptyMessage);
    return;
  }

  notes.forEach((note) => {
    const noteItem = document.createElement("li");
    const title = document.createElement("h2");
    const body = document.createElement("p");

    title.textContent = note.title;
    body.textContent = note.body;
    noteItem.append(title, body);
    notesList.append(noteItem);
  });
}

async function loadNotes() {
  const loadButton = document.querySelector("#load-btn");
  loadButton.disabled = true;
  setStatus("Loading notes...", "loading");

  try {
    const notes = await request(`${API_URL}?_limit=10`);
    renderNotes(notes);
    setStatus(
      notes.length === 0
        ? "Loaded 0 notes from the server."
        : `Loaded ${notes.length} notes from the server.`,
      "success",
    );
  } catch (error) {
    renderNotes([]);
    setStatus("Unable to load notes. Please try again.", "error");
  } finally {
    loadButton.disabled = false;
  }
}

document.querySelector("#load-btn").addEventListener("click", loadNotes);
