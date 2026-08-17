// Native professional report entry.
#import "report-theme.typ": report-accent, report-theme

#show: report-theme.with(
  title: "Jennefer Ann Art Gallery",
  author: "Manus AI",
  rhythm: "report",
  running-header: true,
)

#page(margin: (top: 30%, x: 2.2cm), numbering: none, header: none)[
  #set par(first-line-indent: 0em)
  #align(center)[
    #text(size: 26pt, weight: "bold", fill: report-accent)[Jennefer Ann Art Gallery]
    #v(0.5em)
    #text(size: 14pt, fill: luma(80))[Website Operations & Growth Report]
    #v(2em)
    #line(length: 40%, stroke: 0.5pt + luma(160))
    #v(2em)
    #text(size: 11pt)[Prepared by Manus AI]
    #v(0.25em)
    #text(size: 10pt, fill: luma(105))[Operational snapshot: 17 August 2026]
  ]
]

#page(numbering: none, header: none)[
  #outline(title: [Contents], indent: 1.5em)
]

#counter(page).update(1)

= Executive summary

The website now operates as a public art-gallery storefront with a protected Administrator control plane. Jennefer can manage artworks, collections, availability, prices, descriptions, collector leads, consented newsletter subscribers, first-party analytics, search-readiness checks, and operational alerts without relying on outside assistance for routine changes.

The Command Centre has been rebuilt as a teal executive dashboard. It uses recorded first-party activity and real database records rather than display-only figures. Where a signal is not yet present, such as completed paid orders or connected advertising spend, the interface deliberately shows a transparent zero or connection-required state.

#table(
  columns: (1fr, 1fr, 1fr),
  inset: 8pt,
  stroke: 0.4pt + luma(180),
  fill: (x, y) => if y == 0 { luma(235) } else { none },
  [Area], [Current capability], [Operational status],
  [Administration], [Secure native sign-in, management tools, alerts and reporting], [Live],
  [Growth], [First-party sessions, views, engagement, sources and attention funnel], [Live],
  [Collectors], [Consented signup list, Newsletter Studio drafts and reply drafts], [Live; delivery awaits Gmail OAuth],
  [Sales], [Available/sold status, reserve, inquiry and purchase pathways], [Live; payment links await merchant setup],
  [Geography], [Dedicated panel and GA4 configuration field], [Awaiting authorised GA4 Data API]
)

= Command Centre and analytics

The protected Command Centre opens with the greeting *“Welcome back, Jennefer”* and presents executive panels for newsletter growth, monthly views and completed sales, SEO readiness, collector attention, and operations. Jennefer can choose any gallery artwork or upload a private image as the background for her own Administrator profile card; it is displayed only inside the protected dashboard.

== Recorded operational snapshot

At the latest verified dashboard review, the selected seven-day view contained *15* real first-party sessions, *27* recorded public page views, and *1* consented collector subscription. The engagement, device, source, page-interest, conversion and funnel views are backed by anonymous session records and event records. These values change with real visitor activity.

#table(
  columns: (1.3fr, 2.7fr),
  inset: 7pt,
  stroke: 0.35pt + luma(185),
  [Signal], [What the dashboard reports],
  [Sessions and views], [Anonymous public visitor sessions and recorded public page loads.],
  [Attention funnel], [Page views, artwork-detail views, high-intent clicks, and completed purchases.],
  [Active engagement], [Observed visible-session activity rather than invented time-on-site.],
  [Collector interest], [Top pages and recorded high-intent activity around gallery and artwork paths.],
  [Device mix], [Aggregated desktop, mobile and other device categories without raw user-agent storage.],
  [Traffic sources], [Recorded first-party source and referrer summaries where available.]
)

== Data boundaries

The system does not store raw IP addresses, visitor email addresses inside analytics events, or inferred geographic positions. Geographic country and city points require an owner-authorised Google Analytics Data API connection. The optional GA4 settings page accepts a measurement ID and property ID but correctly remains *not connected* until OAuth access is approved.

= Website management and gallery operations

The Administrator Management Portal provides the owner with full routine control of the art gallery. Artwork Studio supports image upload, inline editing, price and description changes, sold or available status, collection movement, featured status, selection and bulk actions. The collection, contact, comments, reviews and collector areas remain protected by the Administrator session.

Available and sold states are kept visible to public visitors. The gallery includes product purchase cards, a reserve option, WhatsApp inquiry entry points, certificate-of-authenticity messaging, shipping information, and a commission request form. These conversion paths are live; genuine checkout payment links still require the owner’s PayFast merchant URLs before card or deposit checkout can be activated.

= Search readiness and marketing controls

The current site includes a focused title and description, canonical URLs for public pages, robots directives, sitemap, structured artwork metadata, social sharing controls, and the configured public Google Analytics tag. The dashboard SEO panel verifies the tag, robots file and sitemap at runtime.

Advertising spend is intentionally not displayed as a manufactured value. The dashboard notes that verified ad-platform access is needed before spend or return-on-ad-spend reporting can be shown. This preserves the integrity of the operational board and prevents a marketing decision from being based on false data.

= Newsletter Studio and collector communications

Newsletter Studio is the protected workspace for collector communication. It displays only visitors who explicitly consented to gallery updates, allows the Administrator to write studio news, exhibition notes, commission openings, conservation campaigns and upcoming-adventure announcements, and stores drafts with the current consented-recipient count.

The Studio also provides draft replies for genuine contact, commission and purchase enquiries. Campaigns and direct replies are deliberately represented as *drafts* until the sending account is properly authorised. No user-facing email is claimed as sent, and no subscriber is automatically contacted from an unverified delivery provider.

The confirmed intended studio sender is #raw("jennefer.ann.gg@gmail.com"). The next operational step is Google OAuth authorisation for that exact mailbox. The existing unrelated Gmail connection is not used.

= Security and privacy controls

Administrator access is enforced with gallery-native username and password validation on the server, an encrypted HTTP-only session cookie, protected routes, and server-side Administrator procedure checks. Browser sign-out returns protected routes to the sign-in gate, while logged-out and non-Administrator callers are blocked from protected data procedures.

Collector signup forms include explicit consent wording. The system tracks only the first-party behaviour needed for the operational dashboard and does not use bots, fake reviews, cold messages, or fabricated conversion data.

= Current dependencies and recommended owner actions

#table(
  columns: (1.35fr, 2.65fr),
  inset: 7pt,
  stroke: 0.35pt + luma(185),
  fill: (x, y) => if y == 0 { luma(235) } else { none },
  [Owner action], [Why it matters],
  [Authorise Jennefer Gmail OAuth], [Enables verified Newsletter Studio sending and replies from #raw("jennefer.ann.gg@gmail.com"). Delivery must still require an Administrator-approved send action.],
  [Authorise GA4 Data API, if desired], [Unlocks verified country/city reporting and historical GA4 metrics without compromising the existing first-party dashboard.],
  [Provide PayFast links], [Enables live payment and deposit checkout for specific artworks.],
  [Confirm WhatsApp number], [Final confirmation that the public inquiry route uses the artist-approved phone number.],
  [Submit a real collector signup], [Allows the owner to complete final end-to-end consented-signup verification in the live portal.]
)

= Implementation validation

The latest completed validation run recorded *55 passing automated tests*, a passing TypeScript check, and a successful production build. Browser verification confirmed the secure Command Centre, the executive panels, the artwork-profile spotlight selector, the Newsletter Studio, the optional GA4 settings state, and clean browser-console output.

> This report is an operational status document, not a forecast. Visitor, sales, engagement and collector figures should continue to be read from the protected live dashboard as new real activity is recorded.
