// Featured-listing ad products (MVP). Prices follow the launch pricing matrix;
// SPONSORED_AGENT and BANNER_AD products arrive in Phase 2.
export type AdProduct = {
  id: string;
  name: string;
  description: string;
  pricePi: number;
  durationDays: number;
};

export const FEATURED_PRODUCTS: AdProduct[] = [
  {
    id: "FEATURED_7",
    name: "Standard Featured",
    description: "Top of search for your city/region",
    pricePi: 8,
    durationDays: 7,
  },
  {
    id: "FEATURED_14",
    name: "Premium Featured",
    description: "Top of search + homepage carousel",
    pricePi: 20,
    durationDays: 14,
  },
  {
    id: "FEATURED_21",
    name: "Launch Spotlight",
    description: "Premium placement + alert push",
    pricePi: 35,
    durationDays: 21,
  },
];

export function getProduct(id: string): AdProduct | undefined {
  return FEATURED_PRODUCTS.find((p) => p.id === id);
}
