export type ArtworkPaymentLinks = {
  /** A merchant-hosted full-payment URL, such as a PayFast payment link. */
  fullPaymentLink?: string;
  /** A merchant-hosted deposit-payment URL for the same artwork. */
  depositPaymentLink?: string;
  depositPercentage?: number;
};

/**
 * Add merchant-hosted payment links here by artwork slug after they are created.
 * Do not add merchant IDs, passphrases, or any private PayFast credentials here.
 */
const ARTWORK_PAYMENT_LINKS: Record<string, ArtworkPaymentLinks> = {
  // Example once links are supplied:
  // "riana-1769842761058": {
  //   fullPaymentLink: "https://payfast.io/...",
  //   depositPaymentLink: "https://payfast.io/...",
  //   depositPercentage: 30,
  // },
};

export function getArtworkPaymentLinks(artworkSlug: string): ArtworkPaymentLinks {
  return ARTWORK_PAYMENT_LINKS[artworkSlug] ?? {};
}
