import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// The full context shape the intake agent is responsible for filling in.
// Mirrors MerchantContext in prisma/schema.prisma.
export const INTAKE_FIELDS = [
  "productCategory", "productType", "catalogSizeBand", "priceRangeLow", "priceRangeHigh",
  "sellChannels", "deliveryModel", "logisticsPartner",
  "paymentGateway", "inventoryTool", "crmTool", "existingDomain",
  "addons",
  "hasBrandAssets", "brandColors", "targetGeography", "teamSize",
  "adSpendAppetite", "launchUrgency", "gstRegistered", "businessType", "returnPolicyStance",
] as const;

const SYSTEM_PROMPT = `You are the Storefront onboarding agent. Your job is to have a short,
warm, efficient conversation with a merchant to learn what they need before their store
is generated. You are not a form — ask one or two questions at a time, follow up naturally,
and infer what you can instead of asking everything explicitly.

You must cover, in roughly this order, but adapt to what the merchant already tells you:
1. What they sell (category, product type, rough catalog size, price range)
2. Where they want to sell (own storefront, Instagram, WhatsApp, marketplaces, offline)
3. Current delivery model (self-fulfilled, 3PL, pickup, dropship)
4. Existing integrations (payments, inventory tools, CRM, existing domain)
5. What they want to add on (marketing automation, pricing AI, reviews, loyalty, analytics)
6. Brand assets (do they have a logo/colors, or should we generate one)
7. Target geography, team size, ad spend appetite, launch urgency
8. GST registration / business type, and return policy stance (needed for legal pages)

Keep responses under 60 words. When you have enough information for a field, call the
record_context tool with just the new fields you learned — do not wait until the end.
When you believe intake is complete, call record_context with intakeComplete: true.`;

const recordContextTool: Anthropic.Tool = {
  name: "record_context",
  description: "Persist structured merchant context extracted from the conversation so far.",
  input_schema: {
    type: "object",
    properties: {
      productCategory: { type: "string" },
      productType: { type: "string", enum: ["physical", "digital", "service"] },
      catalogSizeBand: { type: "string" },
      priceRangeLow: { type: "number" },
      priceRangeHigh: { type: "number" },
      sellChannels: { type: "array", items: { type: "string" } },
      deliveryModel: { type: "string", enum: ["self_fulfilled", "third_party_logistics", "pickup_only", "dropship"] },
      logisticsPartner: { type: "string" },
      paymentGateway: { type: "string" },
      inventoryTool: { type: "string" },
      crmTool: { type: "string" },
      existingDomain: { type: "string" },
      addons: { type: "array", items: { type: "string" } },
      hasBrandAssets: { type: "boolean" },
      brandColors: { type: "array", items: { type: "string" } },
      targetGeography: { type: "string", enum: ["tier1", "tier2_3", "pan_india", "export"] },
      teamSize: { type: "string", enum: ["solo", "small_team"] },
      adSpendAppetite: { type: "string", enum: ["low", "medium", "high"] },
      launchUrgency: { type: "string", enum: ["today", "this_week", "planning_ahead"] },
      gstRegistered: { type: "boolean" },
      businessType: { type: "string", enum: ["proprietorship", "llp", "pvt_ltd", "unregistered"] },
      returnPolicyStance: { type: "string" },
      intakeComplete: { type: "boolean" },
    },
  },
};

export type IntakeTurn = { role: "user" | "assistant"; content: string };

export async function runIntakeTurn(history: IntakeTurn[]) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    tools: [recordContextTool],
    messages: history,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const toolCall = response.content.find((b) => b.type === "tool_use");

  return {
    reply: textBlock && textBlock.type === "text" ? textBlock.text : "",
    extractedFields: toolCall && toolCall.type === "tool_use" ? (toolCall.input as Record<string, unknown>) : null,
  };
}
