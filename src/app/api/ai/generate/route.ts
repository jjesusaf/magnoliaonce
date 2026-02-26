import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

const SYSTEM_PROMPT = `You are a product copywriter for "Magnolia Once", a contemporary floral studio and shop in Mexico.
You write bilingual product listings (Spanish and English) for floral arrangements and bouquets.

Given an image of a floral product and/or a text description, generate a complete product listing.

IMPORTANT RULES:
- Names should be elegant, short (1-3 words), and evocative. Think luxury brand naming.
- Descriptions should be 1-2 sentences, poetic but informative. Mention key flowers, colors, and style.
- Suggest 2-3 size variants (e.g. Petit/Clásico/Grand or Chico/Mediano/Grande) with realistic Mexican florist prices.
- MXN prices should range from $400-$2500 depending on size. USD prices should be roughly MXN/17.
- The slug must be unique and descriptive. Combine the Spanish name with a distinguishing detail (e.g. dominant flower, color, or style). Examples: "aurora-rosas-rojas", "serenata-pastel-peonias", "jardín-silvestre-lavanda". Lowercase, hyphenated, no accents, no generic slugs like "ramo-de-rosas".

Respond ONLY with valid JSON in this exact format:
{
  "name_es": "string",
  "name_en": "string",
  "description_es": "string",
  "description_en": "string",
  "slug": "string",
  "variants": [
    { "label": "string", "priceMXN": number, "priceUSD": number }
  ]
}`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenRouter API key not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { image, description, categorySlug } = body as {
      image?: string;
      description?: string;
      categorySlug?: string;
    };

    if (!image && !description) {
      return NextResponse.json(
        { error: "Provide an image or description" },
        { status: 400 }
      );
    }

    const categoryHint =
      categorySlug === "bouquets"
        ? "This is a hand-tied bouquet."
        : "This is a floral arrangement (centerpiece, vase, or decorative).";

    // Build content array: text first, then image (per OpenRouter recommendation)
    const content: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    > = [];

    let textPrompt = `${categoryHint}\n`;
    if (description) {
      textPrompt += `Description from the florist: "${description}"\n`;
    }
    textPrompt += "Generate the product listing JSON.";

    content.push({ type: "text", text: textPrompt });

    if (image) {
      content.push({
        type: "image_url",
        image_url: { url: image },
      });
    }

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://magnoliaonce.com",
        "X-Title": "Magnolia Once Admin",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("OpenRouter error:", err);
      return NextResponse.json(
        { error: "AI generation failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "";

    // Extract JSON from the response (might be wrapped in ```json blocks)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const generated = JSON.parse(jsonMatch[0]);

    return NextResponse.json(generated);
  } catch (err) {
    console.error("AI generate error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
