const API_URL = "https://jsonplaceholder.typicode.com/posts";

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response;
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

  notes.forEach((note) => notesList.append(createNoteElement(note)));
}

function createNoteElement(note) {
  const noteItem = document.createElement("li");
  const title = document.createElement("h2");
  const body = document.createElement("p");
  const deleteButton = document.createElement("button");

  title.textContent = note.title;
  body.textContent = note.body;
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => deleteNote(note.id, noteItem, deleteButton));
  noteItem.append(title, body, deleteButton);
  return noteItem;
}

async function loadNotes() {
  const loadButton = document.querySelector("#load-btn");
  loadButton.disabled = true;
  setStatus("Loading notes...", "loading");

  try {
    const response = await request(`${API_URL}?_limit=10`);
    const notes = await response.json();
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

async function createNote(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const titleInput = document.querySelector("#title-input");
  const bodyInput = document.querySelector("#body-input");
  const submitButton = document.querySelector("#submit-btn");
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    setStatus("Please enter a title.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    setStatus("Title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }

  submitButton.disabled = true;
  setStatus("Creating note...", "loading");

  try {
    const response = await request(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body, userId: 1 }),
    });
    const note = await response.json();
    const notesList = document.querySelector("#notes-list");
    const emptyMessage = notesList.querySelector("li");

    if (emptyMessage?.textContent === "No notes found.") {
      notesList.replaceChildren();
    }

    notesList.prepend(createNoteElement(note));
    setStatus(`Note created (status ${response.status}, id ${note.id}).`, "success");
    form.reset();
  } catch (error) {
    setStatus("Unable to create note. Please try again.", "error");
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteNote(noteId, noteItem, deleteButton) {
  deleteButton.disabled = true;
  setStatus("Deleting note...", "loading");

  try {
    await request(`${API_URL}/${noteId}`, { method: "DELETE" });
    noteItem.remove();

    const notesList = document.querySelector("#notes-list");
    if (notesList.children.length === 0) {
      renderNotes([]);
    }

    // JSONPlaceholder simulates DELETE without persisting changes, so the removal is
    // applied locally and a later reload restores the practice API's original data.
    setStatus(`Note deleted (status 200, id ${noteId}).`, "success");
  } catch (error) {
    setStatus("Unable to delete note. Please try again.", "error");
  } finally {
    deleteButton.disabled = false;
  }
}

document.querySelector("#load-btn").addEventListener("click", loadNotes);
document.querySelector("#note-form").addEventListener("submit", createNote);
