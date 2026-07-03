import React, { useEffect, useMemo, useState } from "react";
import { getAllResource } from "./api"; // update this import

const LS_KEY = "conditions_cache_v1";

function AccordionItem({ title, content }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, marginBottom: 10 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: 12,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        {title}
        <span style={{ float: "right" }}>{open ? "−" : "+"}</span>
      </button>

      {open && (
  <div style={{ padding: "0 12px 12px" }}>
    {(String(content ?? "")).split('\n').map((line, i, arr) => (
      <React.Fragment key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    ))}
  </div>
)}





    </div>
  );
}

function normalizeToList(data) {
  // Supports multiple common shapes
  if (Array.isArray(data)) return data;
  return data?.items ?? data?.conditions ?? data?.data ?? [];
}

export default function ConditionsAccordionSearch() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      setError("");

      // 1) Immediate load from localStorage for faster refresh
      try {
        const cachedRaw = window.localStorage.getItem(LS_KEY);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          const list = normalizeToList(cached);
          if (!ignore) setItems(Array.isArray(list) ? list : []);
        }
      } catch {
        // ignore cache errors
      }

      // 2) Fetch latest data in background and update cache
      setLoading(true);
      try {
        const data = await getAllResource("conditions");
        const list = normalizeToList(data);

        if (!ignore) {
          setItems(Array.isArray(list) ? list : []);
          window.localStorage.setItem(LS_KEY, JSON.stringify(data));
        }
      } catch (e) {
        if (!ignore) setError(e?.message || "Failed to load conditions");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(() => {
  const query = q.trim().toLowerCase();
  if (!query) return items;

  return items.filter((it) => {
    const title = String(it.title ?? it.name ?? it.condition ?? "").toLowerCase();

    const descList = Array.isArray(it.desc)
      ? it.desc
      : it.desc != null
      ? [String(it.desc)]
      : [];

    const descText = descList.join("\n").toLowerCase();

    const body = String(
      it.body ?? it.description ?? it.text ?? it.content ?? ""
    ).toLowerCase();

    return (
      title.includes(query) ||
      body.includes(query) ||
      descText.includes(query)
    );
  });
}, [items, q]);

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h1>Conditions</h1>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search…"
        style={{
          width: "100%",
          maxWidth: 520,
          padding: 10,
          borderRadius: 8,
          border: "1px solid #ddd",
          marginBottom: 16,
        }}
      />

      {loading && <div>Loading latest…</div>}
      {error && <div style={{ color: "crimson", marginBottom: 16 }}>{error}</div>}

      {!loading && !error && filtered.length === 0 && <div>No results.</div>}

      {filtered.map((it, idx) => (console.log("item desc:", it?.name, it?.desc), (
  <AccordionItem
    key={String(it.id ?? idx)}
    title={it.name}
    content={Array.isArray(it.desc) ? it.desc.join("\n") : String(it.desc ?? "")}
  />
)))}
    </div>
  );
}
