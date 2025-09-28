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

  const { prompt_id, rating } = req.body;

  if (!prompt_id || !rating) {
    return res.status(400).json({ error: "prompt_id and rating are required." });
  }

  const ratingValue = parseInt(rating, 10);
  if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    return res.status(400).json({ error: "Rating must be an integer between 1 and 5." });
  }

  try {
    // Upsert the user's rating. This will insert a new rating or update an existing one.
    const { error: upsertError } = await supabase
      .from("prompt_ratings")
      .upsert({
        user_id: user.id,
        prompt_id: prompt_id,
        rating: ratingValue,
      });

    if (upsertError) throw upsertError;

    // After the rating is recorded, we need to recalculate the average rating
    // and rating count for the prompt. This is best done in a database function
    // for atomicity, but we can do it here for simplicity.

    // 1. Get all ratings for the prompt
    const { data: ratings, error: ratingsError } = await supabase
      .from("prompt_ratings")
      .select("rating")
      .eq("prompt_id", prompt_id);

    if (ratingsError) throw ratingsError;

    // 2. Calculate new average and count
    const rating_count = ratings.length;
    const total_rating_score = ratings.reduce((acc, r) => acc + r.rating, 0);
    const avg_rating = (total_rating_score / rating_count).toFixed(2);

    // 3. Update the prompts table
    const { data: updatedPrompt, error: updateError } = await supabase
      .from("prompts")
      .update({
        avg_rating: avg_rating,
        rating_count: rating_count,
      })
      .eq("id", prompt_id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({ success: true, prompt: updatedPrompt });
  } catch (error) {
    console.error("Rate Prompt API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}