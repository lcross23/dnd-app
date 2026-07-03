import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "myTableRows_v1";

export default function App() {
  const [name, setName] = useState("");
  const [value, setValue] = useState([]);
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);

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
    console.log("SAVE", STORAGE_KEY, rows);
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

    setRows((prev) => [...prev, { name: trimmedName, value: numValue }]);
    setName("");
    setValue("");
  }

  function clearAll() {
    setRows([]);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h2>Persistent Table</h2>

      <form onSubmit={addRow} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="decimal"
        />
        <button type="submit">Add</button>
        <button type="button" onClick={clearAll}>Clear list</button>
      </form>

      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {(sortedRows ?? []).length === 0 ? (
            <tr><td colSpan="2">No rows yet</td></tr>
          ) : (
            sortedRows.map((r, idx) => (
              <tr key={`${r.name}-${r.value}-${idx}`}>
                <td>{r.name}</td>
                <td>{r.value}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
