const BASE_URL = "https://www.dnd5eapi.co";

async function fetchJson(url, { retries = 4, backoffMs = 500 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url);
    if (res.ok) return await res.json();

    // Retry on rate limit
    if (res.status === 429 && attempt < retries) {
      const wait = backoffMs * (attempt + 1);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }

    // Other errors (or out of retries)
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} for ${url}${text ? `: ${text.slice(0, 200)}` : ""}`);
  }
}

async function mapLimit(list, limit, fn) {
  if (!Array.isArray(list) || list.length === 0) return [];
  const results = [];
  let i = 0;

  const workers = new Array(Math.min(limit, list.length)).fill(0).map(async () => {
    while (i < list.length) {
      const idx = i++;
      results[idx] = await fn(list[idx]);
    }
  });

  await Promise.all(workers);
  return results;
}

export async function getAllSpells() {
  const spellIndexes = await fetchJson(BASE_URL + "/api/2014/spells");

  const spells = await mapLimit(
    spellIndexes.results,
    5, // lower = less likely to hit 429
    (index) => fetchJson(BASE_URL + index.url)
  );

  return spells; // <-- this is an array, so your normalizeToList will just return it
}

export async function getAllConditions() {
  const conditionIndexes = await fetchJson(
    BASE_URL + "/api/2014/conditions"
  );

  const conditions = await mapLimit(
    conditionIndexes.results,
    5,
    (index) => fetchJson(BASE_URL + index.url)
  );

  return conditions;
}


const BASE_URL = "https://www.dnd5eapi.co";
export async function getAllConditions() {
  const conditionIndexes = await fetchJson(
    BASE_URL + "/api/2014/conditions"
  );

  const conditions = await mapLimit(
    conditionIndexes.results,
    5,
    (index) => fetchJson(BASE_URL + index.url)
  );

  return conditions;
}