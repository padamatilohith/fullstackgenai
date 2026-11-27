import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const openCount = todos.filter((todo) => !todo.completed).length;
  const doneCount = todos.length - openCount;

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

  function toggleTodo(id) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  function deleteTodo(id) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  }

  return (
    <main className="app-shell">
      <section className="todo-card" aria-labelledby="todo-title">
        <header className="todo-header">
          <div>
            <h1 id="todo-title">My Todo List</h1>
            <p>Organize your day and finish tasks faster.</p>
          </div>
          <span className="item-badge" aria-label={`${todos.length} total items`}>
            {todos.length} items
          </span>
        </header>

        <form className="todo-form" onSubmit={addTodo}>
          <label className="visually-hidden" htmlFor="new-todo">New task</label>
          <input
            id="new-todo"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Add a new task"
          />
          <button type="submit">Add task</button>
        </form>

        <div className="todo-stats" aria-live="polite">
          <span>{openCount} open</span>
          <span>{doneCount} done</span>
        </div>

        {todos.length === 0 ? (
          <p className="empty-state">No tasks yet. Add one above!</p>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li className="todo-item" key={todo.id}>
                <label className="todo-label">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <span className={todo.completed ? "todo-text is-complete" : "todo-text"}>
                    {todo.text}
                  </span>
                </label>
                <button
                  className="remove-button"
                  type="button"
                  aria-label={`Remove ${todo.text}`}
                  onClick={() => deleteTodo(todo.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
