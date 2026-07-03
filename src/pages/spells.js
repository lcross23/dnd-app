import React, { useEffect, useMemo, useState } from "react";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import { getAllResource } from "./api"; // update this import

const LS_KEY = "spells_cache_v1";

function SpellAccordionItem({ spell }) {
  const [open, setOpen] = useState(false);

  const level = spell?.level ?? null;
  const schoolName = spell?.school?.name ?? spell?.school ?? "";
  const components = Array.isArray(spell?.components) ? spell.components : [];
  const label =
    level === 0
      ? "Cantrip"
      : typeof level === "number"
      ? `Level ${level}`
      : null;

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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
          {spell?.name ?? ""}
          {spell?.level === 0 ? " (Cantrip)" : spell?.level ? ` (Lvl ${spell.level})` : ""}
        </span>
        <span>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <AccordionDetails>
          <Box sx={{ width: "100%" }}>
            <Typography variant="h6" component="h4" gutterBottom>
              {spell?.name ?? ""}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              {label ? `${label} ` : ""}
              {schoolName}
              {spell?.level === 0 ? " Cantrip" : ""}
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1,
                mt: 1,
              }}
            >
              <Typography variant="body2">
                <strong>Casting Time:</strong> {spell?.casting_time ?? ""}
              </Typography>

              <Typography variant="body2">
                <strong>Range:</strong> {spell?.range ?? ""}
              </Typography>

              <Typography variant="body2">
                <strong>Components:</strong> {components.join(", ")}
              </Typography>

              <Typography variant="body2">
                <strong>Duration:</strong> {spell?.duration ?? ""}
              </Typography>
            </Box>

            <Typography variant="body2">
                {spell.desc.join("\n")}
              </Typography>
          </Box>
        </AccordionDetails>
      )}
    </div>
  );
}

function normalizeToList(data) {
  if (Array.isArray(data)) return data;

  if (data && typeof data === "object") {
    return (
      data.items ??
      data.spells ??
      data.conditions ??
      data.data ??
      data.results ??
      []
    );
  }

  return [];
}

export default function SpellsAccordionSearch() {
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
      } catch (e) {
        console.log("cache load error:", e);
      }

      // 2) Fetch latest data in background and update cache
      setLoading(true);
      try {
        const data = await getAllResource("spells");

        const list = normalizeToList(data);

        if (!ignore) {
          setItems(Array.isArray(list) ? list : []);
          window.localStorage.setItem(LS_KEY, JSON.stringify(data));
        }
      } catch (e) {
        if (!ignore) setError(e?.message || "Failed to load spells");
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
      const title = String(it?.name ?? it?.title ?? "").toLowerCase();

      const descList = Array.isArray(it?.desc)
        ? it.desc
        : it?.desc != null
        ? [String(it.desc)]
        : [];

      const descText = descList.join("\n").toLowerCase();

      const body = String(
        it?.body ?? it?.description ?? it?.text ?? it?.content ?? ""
      ).toLowerCase();

      return title.includes(query) || body.includes(query) || descText.includes(query);
    });
  }, [items, q]);

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h1>Spells</h1>

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

      {filtered.map((spell, idx) => (
        <SpellAccordionItem
          key={String(spell?.index ?? spell?.id ?? idx)}
          spell={spell}
        />
      ))}
    </div>
  );
}
