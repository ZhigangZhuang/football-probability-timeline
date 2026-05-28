type PolymarketMarket = {
  id?: string;
  slug?: string;
  question?: string;
  outcomes?: string;
  outcomePrices?: string;
  clobTokenIds?: string;
};

type PolymarketEvent = {
  id?: string;
  slug?: string;
  title?: string;
  score?: string;
  startTime?: string;
  finishedTimestamp?: string;
  markets?: PolymarketMarket[];
};

export type PolymarketPricePoint = {
  t: number;
  p: number;
};

const GAMMA_API_BASE = "https://gamma-api.polymarket.com";
const CLOB_API_BASE = "https://clob.polymarket.com";

/**
 * Polymarket market data is public. In a win/draw/win market, outcome prices can
 * be interpreted as implied probabilities for home win, draw, and away win.
 * This project keeps the UI on mock data first, then maps real outcome prices
 * into the same ProbabilityPoint shape when a live slug is supplied.
 */
export async function fetchPolymarketMarketBySlug(slug: string) {
  const url = new URL("/markets", GAMMA_API_BASE);
  url.searchParams.set("slug", slug);

  const response = await fetch(url.toString(), {
    next: { revalidate: 30 }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Polymarket market: ${response.status}`);
  }

  const markets = (await response.json()) as PolymarketMarket[];
  return markets[0] ?? null;
}

export async function fetchPolymarketEventBySlug(slug: string) {
  const url = new URL("/events", GAMMA_API_BASE);
  url.searchParams.set("slug", slug);

  const response = await fetch(url.toString(), {
    next: { revalidate: 30 }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Polymarket event: ${response.status}`);
  }

  const events = (await response.json()) as PolymarketEvent[];
  return events[0] ?? null;
}

/**
 * Historical CLOB prices return timestamped price points for a single token.
 * The next integration step is mapping timestamps to match minutes.
 */
export async function fetchPolymarketPriceHistory(
  tokenId: string,
  options: {
    startTs?: number;
    endTs?: number;
    fidelity?: number;
  } = {}
) {
  const url = new URL("/prices-history", CLOB_API_BASE);
  url.searchParams.set("market", tokenId);
  if (options.startTs) url.searchParams.set("startTs", String(options.startTs));
  if (options.endTs) url.searchParams.set("endTs", String(options.endTs));
  if (options.fidelity) url.searchParams.set("fidelity", String(options.fidelity));

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Failed to fetch price history: ${response.status}`);
  }

  return response.json() as Promise<{ history?: PolymarketPricePoint[] }>;
}

/**
 * Placeholder batch helper for loading several outcome tokens together.
 * Some deployments expose batch history endpoints; if unavailable, this can
 * safely fall back to Promise.all over fetchPolymarketPriceHistory.
 */
export async function fetchBatchPolymarketPriceHistory(
  tokenIds: string[],
  options: {
    startTs?: number;
    endTs?: number;
    fidelity?: number;
  } = {}
) {
  const histories = await Promise.all(
    tokenIds.map(async (tokenId) => ({
      tokenId,
      history: await fetchPolymarketPriceHistory(tokenId, options)
    }))
  );

  return histories;
}
