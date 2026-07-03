import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "myTableRows_v1";

export default function App() {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // editing
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setRows(Array.isArray(parsed) ? parsed : []);
      } catch {
        setRows([]);
      }
    } else {
      setRows([]);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows, loaded]);

  const sortedRows = useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    return [...list].sort((a, b) => Number(b.value) - Number(a.value));
  }, [rows]);

  function addRow(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    const numValue = Number(value);

    if (!trimmedName) return;
    if (!Number.isFinite(numValue)) return;

    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: trimmedName, value: numValue },
    ]);
    setName("");
    setValue("");
  }

  function clearAll() {
    setRows([]);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function startEdit(row) {
    setEditingId(row.id);
    setEditName(row.name);
    setEditValue(String(row.value));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditValue("");
  }

  function saveEdit(id) {
    const trimmedName = editName.trim();
    const numValue = Number(editValue);

    if (!trimmedName) return;
    if (!Number.isFinite(numValue)) return;

    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, name: trimmedName, value: numValue } : r
      )
    );

    cancelEdit();
  }

  function deleteRow(id) {
    setRows((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) cancelEdit();
  }

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h2>Initiative Table</h2>

      <form
        onSubmit={addRow}
        style={{ display: "flex", gap: 8, marginBottom: 12 }}
      >
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Initiative"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="decimal"
        />
        <button type="submit">Add</button>
        <button type="button" onClick={clearAll}>
          Clear list
        </button>
      </form>

      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Initiative</th>
            <th style={{ width: 220 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td colSpan="3">No rows yet</td>
            </tr>
          ) : (
            sortedRows.map((r) => (
              <tr key={r.id}>
                {editingId === r.id ? (
                  <>
                    <td>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        inputMode="decimal"
                      />
                    </td>
                    <td>
                      <button type="button" onClick={() => saveEdit(r.id)}>
                        Save
                      </button>{" "}
                      <button type="button" onClick={cancelEdit}>
                        Cancel
                      </button>{" "}
                      <button type="button" onClick={() => deleteRow(r.id)}>
                        Delete
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{r.name}</td>
                    <td>{r.value}</td>
                    <td>
                      <button type="button" onClick={() => startEdit(r)}>
                        Edit
                      </button>{" "}
                      <button type="button" onClick={() => deleteRow(r.id)}>
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
