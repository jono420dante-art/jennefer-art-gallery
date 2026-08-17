# Owner Activation Checklist

## Purpose

The gallery is operational with protected artwork management, collector capture, first-party analytics, sales enquiry pathways, and the Command Centre. The items below are **optional owner-controlled activations** that require a verified external account, merchant link, approval, or a real consented action. They are intentionally not simulated in the live site.

| Activation | Current website status | Owner input required | Where to complete it |
|---|---|---|---|
| Gmail newsletter delivery | Newsletter Studio stores consented collectors, drafts, and prepared replies. Sending is disabled. | Authorise `jennefer.ann.gg@gmail.com` through Google OAuth. | Command Centre → **Connect Gmail** → Newsletter Studio. |
| Geographic reporting | Geographic view is visible with an honest no-data state. First-party analytics never guesses visitor locations. | Numeric GA4 Property ID, enabled Google Analytics Data API, and read-only service-account access. | Follow `GA4_CONNECTION_HANDOFF.md`; then complete the secure project connection. |
| PayFast payments | Artwork pages support Buy Now, 30% reservation, WhatsApp, and internal checkout flows. | Buyer-facing hosted full-payment and deposit URLs per artwork. | Follow `PAYFAST_HANDOFF.md` and add approved public URLs by artwork slug. |
| WhatsApp promotion | Artwork-specific WhatsApp enquiry buttons use the configured studio contact. | Confirm that the public contact number is approved by Jennefer before promotion. | Review `client/src/lib/galleryContact.ts` with the artist. |
| Live collector signup proof | Consent capture and protected subscriber administration are active. | One real visitor or owner email with explicit consent to subscribe. | Submit from the homepage and confirm it in Admin → Newsletter Studio. |

## Analytics Boundary

The public site deliberately sends traffic to both configured GA4 properties, **G-J23S2RL6HP** and **G-BVGFXTT1HB**, through one Google tag loader. The Command Centre reports a separate first-party dataset, so its views, events, attention funnel, and newsletter figures are not doubled by the dual GA4 configuration.

> Never paste passwords, merchant keys, private API tokens, Gmail app passwords, or Google service-account JSON into public forms, the frontend code, or an artwork description. Use the protected project connection or secure-secret flow for private credentials.

## Safe Launch Sequence

Start with an artist-approved WhatsApp contact and the existing purchase/reservation pathways. Next, authorise Gmail if newsletter delivery is desired. Add PayFast hosted links only after confirming each amount and deposit link. Finally, connect GA4 reporting if verified country/city reporting is required in the Command Centre. The dashboard remains useful throughout because its first-party metrics operate independently.
