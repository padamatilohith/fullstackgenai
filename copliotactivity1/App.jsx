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

  function toggleTodo(id) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
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
              <li key={todo.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <span
                    style={{
                      textDecoration: todo.completed ? "line-through" : "none",
                    }}
                  >
                    {todo.text}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
