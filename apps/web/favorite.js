import { createServerClient } from "@supabase/ssr";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => req.cookies[name],
      set: (name, value, options) => res.setHeader('Set-Cookie', `${name}=${value}; Path=${options.path}; Max-Age=${options.maxAge}; HttpOnly=${options.httpOnly}; Secure=${options.secure}; SameSite=${options.sameSite}`),
      remove: (name, options) => res.setHeader('Set-Cookie', `${name}=; Path=${options.path}; Max-Age=0; HttpOnly=${options.httpOnly}; Secure=${options.secure}; SameSite=${options.sameSite}`),
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { promptId: prompt_id } = req.body;
  const user_id = user.id;

  try {
    // Check if the favorite already exists
    const { data: existingFavorite, error: selectError } = await supabase
      .from("prompt_favorites")
      .select("*")
      .eq("user_id", user_id)
      .eq("prompt_id", prompt_id)
      .single();

    if (selectError && selectError.code !== "PGRST116") throw selectError; // Ignore 'no rows' error

    if (existingFavorite) {
      // If it exists, unfavorite it
      const { error } = await supabase.from("prompt_favorites").delete().match({ user_id, prompt_id });
      if (error) throw error;
      return res.status(200).json({ favorited: false, message: "Unfavorited successfully" });
    } else {
      // If it doesn't exist, favorite it
      const { error } = await supabase.from("prompt_favorites").insert({ user_id, prompt_id });
      if (error) throw error;
      return res.status(200).json({ favorited: true, message: "Favorited successfully" });
    }
  } catch (error) {
    console.error("Favorite API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}