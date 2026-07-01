import { NextRequest, NextResponse } from "next/server";
import { generateStorefrontCopy } from "../../../../../../packages/agents/src/generationAgent";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { merchantId } = await req.json();
  if (!merchantId) {
    return NextResponse.json({ error: "merchantId is required" }, { status: 400 });
  }

  const context = await db.merchantContext.findUnique({ where: { merchantId } });
  if (!context?.intakeComplete) {
    return NextResponse.json({ error: "Intake is not complete for this merchant" }, { status: 409 });
  }

  const generated = await generateStorefrontCopy({
    productCategory: context.productCategory,
    productType: context.productType,
    sellChannels: context.sellChannels,
    targetGeography: context.targetGeography,
  });

  if (!generated) {
    return NextResponse.json({ error: "Generation failed" }, { status: 502 });
  }

  const { heroHeadline, heroSubcopy, campaignVariants } = generated as {
    heroHeadline: string;
    heroSubcopy: string;
    campaignVariants: { channel: string; headline: string; body: string }[];
  };

  const store = await db.store.upsert({
    where: { merchantId },
    create: { merchantId, heroCopy: `${heroHeadline}\n\n${heroSubcopy}` },
    update: { heroCopy: `${heroHeadline}\n\n${heroSubcopy}` },
  });

  await Promise.all(
    campaignVariants.map((v) =>
      db.campaign.create({
        data: {
          merchantId,
          channel: v.channel,
          variants: { create: [{ headline: v.headline, body: v.body }] },
        },
      })
    )
  );

  return NextResponse.json({ store, campaignVariants });
}
