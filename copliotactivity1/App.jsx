import React, { useState } from "react";

const App = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  const addTodo = (e) => {
    e.preventDefault();


    if (!input.trim()) return;

    const newTodo = {
      id: Date.now(),
      text: input.trim(),
      completed: false,
    };

    setTodos([...todos, newTodo]);
    setInput("");
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Todo List</h1>
            <p style={styles.subtitle}>Organize your day and finish tasks faster.</p>
          </div>
          <span style={styles.badge}>{todos.length} items</span>
        </div>

        <form onSubmit={addTodo} style={styles.form}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new task"
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Add
          </button>
        </form>

        <div style={styles.stats}>
          <span>{todos.filter((todo) => !todo.completed).length} open</span>
          <span>{todos.filter((todo) => todo.completed).length} done</span>
        </div>

        <ul style={styles.list}>
          {todos.length === 0 ? (
            <li style={styles.empty}>No tasks yet. Add one above!</li>
          ) : (
            todos.map((todo) => (
              <li key={todo.id} style={styles.item}>
                <label style={styles.taskRow}>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    style={styles.checkbox}
                  />
                  <span
                    style={{
                      ...styles.taskText,
                      textDecoration: todo.completed ? "line-through" : "none",
                      color: todo.completed ? "#8f9bb3" : "#1f2937",
                    }}
                  >
                    {todo.text}
                  </span>
                </label>
                <button onClick={() => deleteTodo(todo.id)} style={styles.deleteButton}>
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "radial-gradient(circle at top, #eef2ff 0%, #dbeafe 35%, #eff6ff 100%)",
    padding: "24px",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "520px",
    background: "rgba(255,255,255,0.96)",
    padding: "30px",
    borderRadius: "28px",
    boxShadow: "0 30px 80px rgba(15,23,42,0.12)",
    border: "1px solid rgba(148,163,184,0.18)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "2rem",
    color: "#0f172a",
  },
  subtitle: {
    margin: "8px 0 0 0",
    color: "#475569",
    fontSize: "0.95rem",
    lineHeight: 1.5,
  },
  badge: {
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#eef2ff",
    color: "#4338ca",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
  form: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "12px",
    marginBottom: "18px",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    color: "#0f172a",
    fontSize: "1rem",
    outline: "none",
  },
  button: {
    padding: "14px 18px",
    border: "none",
    borderRadius: "16px",
    background: "#4338ca",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  stats: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    padding: "14px 18px",
    borderRadius: "18px",
    background: "#f8fafc",
    color: "#334155",
    fontSize: "0.95rem",
    marginBottom: "18px",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: "12px",
  },
  empty: {
    padding: "22px",
    borderRadius: "18px",
    background: "#f8fafc",
    color: "#64748b",
    textAlign: "center",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 18px",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
    border: "1px solid rgba(148,163,184,0.18)",
  },
  taskRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flex: 1,
    cursor: "pointer",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    accentColor: "#4338ca",
    cursor: "pointer",
  },
  taskText: {
    fontSize: "1rem",
    lineHeight: 1.5,
  },
  deleteButton: {
    padding: "10px 14px",
    border: "none",
    borderRadius: "14px",
    background: "#f87171",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
  },
};

export default App;
