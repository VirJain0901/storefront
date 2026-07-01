import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type MerchantContext = {
  productCategory?: string | null;
  productType?: string | null;
  sellChannels?: string[];
  targetGeography?: string | null;
  addons?: string[];
};

const copyTool: Anthropic.Tool = {
  name: "record_storefront_copy",
  description: "Persist generated homepage copy and ad campaign variants.",
  input_schema: {
    type: "object",
    required: ["heroHeadline", "heroSubcopy", "campaignVariants"],
    properties: {
      heroHeadline: { type: "string" },
      heroSubcopy: { type: "string" },
      campaignVariants: {
        type: "array",
        items: {
          type: "object",
          required: ["channel", "headline", "body"],
          properties: {
            channel: { type: "string" },
            headline: { type: "string" },
            body: { type: "string" },
          },
        },
      },
    },
  },
};

// Generates homepage hero copy + a first batch of ad variants from merchant context.
// Visual asset generation (banners/product scenes) is a separate pluggable step —
// wire it to your image model of choice in this same module.
export async function generateStorefrontCopy(context: MerchantContext) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    system: `You write concise, plain-spoken e-commerce copy. No filler, no hype adjectives.
Write from the shopper's side: what they get, not how the store was built. Match tone to
the product category and target geography given.`,
    tools: [copyTool],
    tool_choice: { type: "tool", name: "record_storefront_copy" },
    messages: [
      {
        role: "user",
        content: `Generate homepage hero copy and 3 ad campaign variants (one per relevant
channel from: ${JSON.stringify(context.sellChannels ?? [])}) for a merchant selling
${context.productCategory ?? "products"} (${context.productType ?? "physical"}), targeting
${context.targetGeography ?? "pan_india"}.`,
      },
    ],
  });

  const toolCall = response.content.find((b) => b.type === "tool_use");
  return toolCall && toolCall.type === "tool_use" ? toolCall.input : null;
}
