import React, { useState } from "react";

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
    <main className="app">
      <section className="todo-card">
        <header>
          <div>
            <h1>My Todo List</h1>
            <p>Organize your day and finish tasks faster.</p>
          </div>
          <span>{todos.length} items</span>
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

        <div aria-live="polite">
          <span>{openCount} open</span>
          {" · "}
          <span>{doneCount} done</span>
        </div>

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
                <button type="button" onClick={() => deleteTodo(todo.id)}>
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
