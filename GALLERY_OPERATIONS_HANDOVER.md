# Jennefer Ann Gallery — Operations Handover

## Secure Administrator access

Open `/admin-login` and sign in with the Administrator credentials configured in the protected project settings. A valid sign-in creates an encrypted, HTTP-only Administrator session and redirects to **Gallery Command Centre** at `/admin-dashboard`. The public gallery remains available without sign-in; all management routes and sensitive data procedures stay restricted to an Administrator session.

Use **Sign out** in the navigation after a management session. The button clears the native Administrator session and returns protected routes to the sign-in gate.

## Artwork and collector management

Open **Manage artwork** from Gallery Command Centre or visit `/admin`. The management studio provides artwork upload, editing, availability and sold status, collection movement, batch operations, comments and review moderation, commission/contact leads, order views, payment settings, and the protected **Collector** subscriber tab.

The Collector tab lists first-party subscribers with their signup date. Subscriber removal requires confirmation. The public collector popup, homepage collector panel, and footer collector form all write to the same protected gallery database. The forms require explicit consent before they store a subscriber.

## Newsletter operating model

This gallery is currently configured for **first-party subscriber collection only**. It intentionally does not connect to Mailchimp, Brevo, MailerLite, or another outbound mail service. That means collector email addresses are stored securely for export and future campaigns, but the site does not automatically send a double-opt-in or welcome email.

To launch campaigns later, export subscribers from the protected Collector tab and connect a consent-respecting email provider. Configure the provider’s double opt-in and welcome sequence there; do not add subscribers manually without their permission.

## Growth, SEO, and reports

Open **Growth & analytics** in Gallery Command Centre. The dashboard uses first-party, privacy-safe activity data for sessions, page views, conversion clicks, sources, referrers, top pages, and traffic periods. The **PDF report** button downloads a protected server-generated report for the selected range.

The **SEO dashboard** validates titles, descriptions, robots directives, sitemap availability, Google Analytics tagging, and artwork structured data. Public routes also publish canonical URLs to the live gallery domain.

> Geographic visitor reporting is not fabricated. The dashboard links to the documented GA4 connection path for geographic history once Google Analytics Data API access is configured.

## First-party system alerts

The **Operational notices** panel in Gallery Command Centre is a durable Administrator-only history. It records real collector enquiries, visitor comments, review submissions, orders, collector signups, and sold-artwork status updates. Historical real records were backfilled when the feature was added.

Use the check control on an event to mark it read, or **Mark read** to clear all currently unread event notices. This changes only the event’s read state; it never deletes the source lead, review, subscriber, or order.

## Launch dependencies

| Dependency | What is needed |
|---|---|
| WhatsApp sales link | Artist confirmation that the configured South African number is approved for public buyer enquiries. |
| PayFast checkout | Merchant-provided hosted payment and deposit URLs for each artwork. Follow `PAYFAST_HANDOFF.md`. |
| GA4 geography/history | Google Analytics Data API access, as documented in `GA4_CONNECTION_HANDOFF.md`. |
| Automated newsletters | An external consent-based email provider, if welcome emails, double opt-in, or campaigns are later required. |
