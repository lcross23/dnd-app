const BASE_URL = "https://www.dnd5eapi.co";

async function fetchJson(url, { retries = 4, backoffMs = 500 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url);

    if (res.ok) return await res.json();

    // Retry on rate limit
    if (res.status === 429 && attempt < retries) {
      const wait = backoffMs * (attempt + 1);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }

    // Other errors (or out of retries)
    const text = await res.text().catch(() => "");
    throw new Error(
      `HTTP ${res.status} for ${url}${text ? `: ${text.slice(0, 200)}` : ""}`
    );
  }
}

async function mapLimit(list, limit, fn) {
  if (!Array.isArray(list) || list.length === 0) return [];
  const results = [];
  let i = 0;

  const workers = new Array(Math.min(limit, list.length))
    .fill(0)
    .map(async () => {
      while (i < list.length) {
        const idx = i++;
        results[idx] = await fn(list[idx]);
      }
    });

  await Promise.all(workers);
  return results;
}

const ENDPOINTS = {
  "ability-scores": "/api/2014/ability-scores",
  alignments: "/api/2014/alignments",
  backgrounds: "/api/2014/backgrounds",
  classes: "/api/2014/classes",
  conditions: "/api/2014/conditions",
  "damage-types": "/api/2014/damage-types",
  equipment: "/api/2014/equipment",
  "equipment-categories": "/api/2014/equipment-categories",
  feats: "/api/2014/feats",
  features: "/api/2014/features",
  languages: "/api/2014/languages",
  "magic-items": "/api/2014/magic-items",
  "magic-schools": "/api/2014/magic-schools",
  monsters: "/api/2014/monsters",
  proficiencies: "/api/2014/proficiencies",
  races: "/api/2014/races",
  "rule-sections": "/api/2014/rule-sections",
  rules: "/api/2014/rules",
  skills: "/api/2014/skills",
  spells: "/api/2014/spells",
  subclasses: "/api/2014/subclasses",
  subraces: "/api/2014/subraces",
  traits: "/api/2014/traits",
  "weapon-properties": "/api/2014/weapon-properties",
};

export async function getAllResource(resourceKey, { limit = 5 } = {}) {
  const path = ENDPOINTS[resourceKey];
  if (!path) throw new Error(`Unknown resourceKey: ${resourceKey}`);

  const index = await fetchJson(BASE_URL + path);
  const results = index?.results ?? [];

  return mapLimit(results, limit, (item) => fetchJson(BASE_URL + item.url));
}

export const getAllSpells = () => getAllResource("spells");
export const getAllConditions = () => getAllResource("conditions");
