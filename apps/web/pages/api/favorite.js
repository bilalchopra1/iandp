import { createPagesServerClient } from "@supabase/ssr";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const supabase = createPagesServerClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { promptId } = req.body;
  const userId = user.id;

  try {
    // Check if the favorite already exists
    const { data: existing, error: selectError } = await supabase
      .from("prompt_favorites")
      .select("*")
      .eq("user_id", userId)
      .eq("prompt_id", promptId)
      .single();

    if (existing) {
      // Unfavorite
      await supabase.from("prompt_favorites").delete().match({ user_id: userId, prompt_id: promptId });
      return res.status(200).json({ favorited: false });
    } else {
      // Favorite
      await supabase.from("prompt_favorites").insert({ user_id: userId, prompt_id: promptId });
      return res.status(200).json({ favorited: true });
    }
  } catch (error) {
    // Ignore "PGRST116" which means no rows were found on the select, which is expected when favoriting for the first time.
    if (error.code !== 'PGRST116') {
      console.error("Favorite API Error:", error);
      return res.status(500).json({ error: error.message });
    }
     // If the error was PGRST116, it means we should favorite it.
    await supabase.from("prompt_favorites").insert({ user_id: userId, prompt_id: promptId });
    return res.status(200).json({ favorited: true });
  }
}