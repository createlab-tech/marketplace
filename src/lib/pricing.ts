export const SELLER_PAYOUTS = {
  free: 0.7,
  pro: 0.8,
  studio: 0.85,
} as const;

export const formatSellerPayout = (plan: keyof typeof SELLER_PAYOUTS) => `${(SELLER_PAYOUTS[plan] * 100).toFixed(0)}%`;
