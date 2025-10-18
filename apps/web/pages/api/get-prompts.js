import { createServerClient } from "@supabase/ssr";

const PAGE_SIZE = 20;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { page = 1, scope = "all", search = "", sort = "newest", tags } = req.query;
  const pageNum = parseInt(page, 10);
  const from = (pageNum - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => req.cookies[name],
      set: (name, value, options) => res.setHeader('Set-Cookie', `${name}=${value}; Path=${options.path}; Max-Age=${options.maxAge}; HttpOnly=${options.httpOnly}; Secure=${options.secure}; SameSite=${options.sameSite}`),
      remove: (name, options) => res.setHeader('Set-Cookie', `${name}=; Path=${options.path}; Max-Age=0; HttpOnly=${options.httpOnly}; Secure=${options.secure}; SameSite=${options.sameSite}`),
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  try {
    let query = supabase
      .from("prompts")
      .select("*, images(storage_path), prompt_favorites(user_id)")
      .order(sort === "rating" ? "avg_rating" : "created_at", { ascending: false })
      .range(from, to);

    if (scope === "history") {
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      query = query.eq("user_id", user.id);
    }

    if (search) {
      query = query.textSearch("prompt_text", search, { type: "websearch" });
    }

    if (tags) {
      const tagList = tags.split(",");
      query = query.contains("style_tags", tagList);
    }

    const { data: prompts, error } = await query;

    if (error) throw error;

    res.status(200).json({ prompts });
  } catch (error) {
    console.error("Error fetching prompts:", error);
    res.status(500).json({ error: error.message || "Failed to fetch prompts." });
  }
}