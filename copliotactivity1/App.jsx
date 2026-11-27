import React, { useState } from "react";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  function addTodo(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;

    setTodos((currentTodos) => [
      ...currentTodos,
      { id: Date.now(), text, completed: false },
    ]);
    setInput("");
  }

  return (
    <main className="app">
      <section className="todo-card">
        <header>
          <h1>My Todo List</h1>
          <p>Organize your day and finish tasks faster.</p>
        </header>

        <form onSubmit={addTodo}>
          <label htmlFor="new-todo">New task</label>
          <input
            id="new-todo"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Add a new task"
          />
          <button type="submit">Add task</button>
        </form>

        {todos.length === 0 ? (
          <p>No tasks yet. Add one above!</p>
        ) : (
          <ul>
            {todos.map((todo) => (
              <li key={todo.id}>{todo.text}</li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
