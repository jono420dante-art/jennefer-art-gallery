# PayFast Hosted Payment-Link Handoff

The gallery’s sales card is ready to use a **merchant-hosted full-payment link** and a separate **30% deposit link** for every original artwork. Until those links are added, available For Sale artworks continue to use the existing internal checkout, while the reservation button opens a prefilled WhatsApp lead for Jennefer.

## Information Needed Per Artwork

| Field | Example | Where it is used |
|---|---|---|
| Artwork slug | `riana-1769842761058` | Matches the original artwork page |
| Full-payment URL | `https://...` | **Buy Now Securely** button |
| Deposit URL | `https://...` | **Reserve with 30% Deposit** button |
| Deposit percentage | `30` | Reservation button label and lead copy |

> Only paste public, buyer-facing payment URLs into the website. Do **not** place merchant IDs, passphrases, private keys, API tokens, or account credentials in the frontend configuration.

## Activation Steps

1. Create the two buyer-facing hosted payment links for each original artwork in the merchant payment dashboard: one for the full price and one for the agreed deposit amount.
2. Send the artwork title, its gallery URL, the full-payment URL, and the deposit URL to the development team.
3. Add the two URLs to `client/src/lib/artworkPaymentLinks.ts` against the matching artwork slug.
4. Verify the artwork page opens the intended payment page and that the deposit amount matches the card label before promoting the artwork through ads or social media.

## Example Configuration

```ts
"riana-1769842761058": {
  fullPaymentLink: "https://your-merchant-hosted-payment-link",
  depositPaymentLink: "https://your-merchant-hosted-deposit-link",
  depositPercentage: 30,
},
```

## Current Buyer Journeys

| Buyer action | Current behavior | After hosted links are added |
|---|---|---|
| **Buy Now Securely** | Opens the gallery’s existing checkout for For Sale pieces | Opens the artwork’s hosted full-payment page |
| **Reserve with 30% Deposit** | Opens a prefilled WhatsApp reservation request | Opens the artwork’s hosted deposit-payment page |
| **Ask on WhatsApp** | Opens an artwork-specific enquiry message | Remains available as a high-touch sales channel |

The configuration layer is intentionally per artwork. This prevents a buyer from being sent to the wrong amount when the gallery’s originals have different prices.
