import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Project uses Vitest (no Jest) and Supabase (no Express server, so Supertest
 * doesn't apply). These tests simulate the pending → approved flow against a
 * mocked Supabase client and assert that the same query filters used by the
 * app (`status = "approved"`) immediately surface a freshly-approved property
 * in featured and search results.
 */

type Property = {
  id: string;
  title: string;
  city: string;
  type: string;
  price: number;
  status: "pending" | "approved" | "rejected";
  is_featured: boolean;
  is_visible: boolean;
  owner_id: string | null;
  created_at: string;
};

// In-memory fake DB
const db: { properties: Property[] } = { properties: [] };

const reset = () => {
  db.properties = [];
};

// Minimal chainable query builder mimicking supabase-js for our usage
const buildQuery = (table: "properties") => {
  let rows = [...db[table]];
  const api: any = {
    select: () => api,
    eq: (col: string, val: any) => {
      rows = rows.filter((r: any) => r[col] === val);
      return api;
    },
    or: (expr: string) => {
      // expr like: city.ilike.%foo%,title.ilike.%foo%,address.ilike.%foo%
      const parts = expr.split(",").map((p) => {
        const [col, , pattern] = p.split(".");
        return { col, pattern: pattern.replace(/%/g, "").toLowerCase() };
      });
      rows = rows.filter((r: any) =>
        parts.some(({ col, pattern }) =>
          String(r[col] ?? "").toLowerCase().includes(pattern)
        )
      );
      return api;
    },
    order: () => api,
    limit: (n: number) => {
      rows = rows.slice(0, n);
      return Promise.resolve({ data: rows, error: null });
    },
    then: (resolve: any) => resolve({ data: rows, error: null }),
    insert: (row: Property) => {
      db.properties.push(row);
      return Promise.resolve({ data: row, error: null });
    },
    update: (patch: Partial<Property>) => ({
      eq: (col: keyof Property, val: any) => {
        db.properties = db.properties.map((r) =>
          (r as any)[col] === val ? { ...r, ...patch } : r
        );
        return Promise.resolve({ data: null, error: null });
      },
    }),
  };
  return api;
};

const supabase = {
  from: (table: "properties") => buildQuery(table),
};

const makeProperty = (overrides: Partial<Property> = {}): Property => ({
  id: crypto.randomUUID(),
  title: "Test Villa Gachibowli",
  city: "Hyderabad",
  type: "rent",
  price: 25000,
  status: "pending",
  is_featured: true,
  is_visible: true,
  owner_id: "owner-1",
  created_at: new Date().toISOString(),
  ...overrides,
});

// Mirrors useFeaturedProperties query
const fetchFeatured = async () => {
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("status", "approved")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(6);
  return data as Property[];
};

// Mirrors useSearchProperties query
const fetchSearch = async (query: string) => {
  const q = supabase
    .from("properties")
    .select("*")
    .eq("status", "approved")
    .or(`city.ilike.%${query}%,title.ilike.%${query}%`);
  const { data } = await q;
  return data as Property[];
};

// Mirrors PostScreen insert
const createPendingProperty = async (overrides: Partial<Property> = {}) => {
  const row = makeProperty({ status: "pending", ...overrides });
  await supabase.from("properties").insert(row);
  return row;
};

// Mirrors AdminDashboard approve action
const approveProperty = async (id: string) => {
  await (supabase.from("properties") as any)
    .update({ status: "approved" })
    .eq("id", id);
};

describe("Pending → Approved property flow", () => {
  beforeEach(reset);

  it("hides pending properties from featured queries", async () => {
    await createPendingProperty({ title: "Pending Loft" });
    const featured = await fetchFeatured();
    expect(featured).toHaveLength(0);
  });

  it("hides pending properties from search queries", async () => {
    await createPendingProperty({ city: "Hyderabad", title: "Pending Loft" });
    const results = await fetchSearch("Hyderabad");
    expect(results).toHaveLength(0);
  });

  it("surfaces a property in featured immediately after admin approval", async () => {
    const prop = await createPendingProperty({ title: "Brand New Villa" });
    expect(await fetchFeatured()).toHaveLength(0);

    await approveProperty(prop.id);

    const featured = await fetchFeatured();
    expect(featured).toHaveLength(1);
    expect(featured[0].id).toBe(prop.id);
    expect(featured[0].status).toBe("approved");
  });

  it("surfaces a property in search immediately after admin approval", async () => {
    const prop = await createPendingProperty({
      city: "Hyderabad",
      title: "Madhapur 2BHK",
    });
    expect(await fetchSearch("Madhapur")).toHaveLength(0);

    await approveProperty(prop.id);

    const results = await fetchSearch("Madhapur");
    expect(results.map((r) => r.id)).toContain(prop.id);
  });

  it("does not surface rejected properties", async () => {
    const prop = await createPendingProperty({ title: "Bad Listing" });
    await (supabase.from("properties") as any)
      .update({ status: "rejected" })
      .eq("id", prop.id);

    expect(await fetchFeatured()).toHaveLength(0);
    expect(await fetchSearch("Bad")).toHaveLength(0);
  });

  it("only returns featured + approved combined for the featured rail", async () => {
    const featuredApproved = await createPendingProperty({
      title: "Featured Approved",
      is_featured: true,
    });
    const nonFeaturedApproved = await createPendingProperty({
      title: "Plain Approved",
      is_featured: false,
    });
    await approveProperty(featuredApproved.id);
    await approveProperty(nonFeaturedApproved.id);

    const featured = await fetchFeatured();
    const ids = featured.map((p) => p.id);
    expect(ids).toContain(featuredApproved.id);
    expect(ids).not.toContain(nonFeaturedApproved.id);
  });
});
