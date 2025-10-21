import { collections, type Tier } from "../db/mongo.ts";

export async function getSymbolsByTier(tier: Tier, limit?: number): Promise<string[]> {
  const cursor = collections.stocks.find({ tier }, { projection: { symbol: 1 } });
  if (limit) cursor.limit = limit;
  const docs = await cursor.toArray();
  return docs.map((doc) => doc.symbol);
}

export async function seedSymbols(symbols: { symbol: string; tier: Tier; name?: string }[]) {
  const now = new Date();
  for (const entry of symbols) {
    await collections.stocks.updateOne(
      { symbol: entry.symbol },
      {
        $set: {
          symbol: entry.symbol,
          tier: entry.tier,
          name: entry.name,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
  }
}
