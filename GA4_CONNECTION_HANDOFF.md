# GA4 Historical Reporting Connection

The Admin Growth Control panel already collects **first-party live data** from the gallery itself. Adding GA4 is a separate historical-data connection, which will extend the panel with Google’s stored acquisition and campaign history.

## Required Access

| Item | Required value | Purpose |
|---|---|---|
| GA4 property ID | Numeric property identifier | Selects the gallery property for reporting |
| Service-account JSON key | Full JSON key, stored as a server secret | Authenticates server-side reporting requests |
| GA4 property access | Viewer or higher for the service account | Permits read-only report queries |
| Data API enabled | Enabled in the associated Google Cloud project | Allows report requests to the GA4 Data API |

> Keep the service-account JSON key private. It must be stored only as a server secret and must never be copied into the frontend, source repository, client-side variables, or a public payment/configuration file.

## Activation Workflow

1. In the relevant Google Cloud project, enable the **Google Analytics Data API**.
2. Create or select a service account, generate its JSON key, and grant that service-account email Viewer access to the correct GA4 property.
3. Provide the numeric GA4 property ID and the service-account JSON through the project’s secure secrets form.
4. The application will run a read-only report check before displaying historical metrics in Admin.

The GA4 Data API supports authenticated `runReport` requests against a specific GA4 property. Google’s current quickstart documents both service-account authentication and the need to grant access to the target Analytics property.[1]

## What Will Appear After Connection

| First-party dashboard now | GA4 addition after connection |
|---|---|
| Live anonymous sessions, page views, referral domains, UTM sources, and gallery conversion clicks | Historical Google acquisition and campaign reporting from the connected GA4 property |
| Starts collecting when the new tracker is live | Includes eligible historical GA4 data already collected in the selected property |
| No external credential required | Requires the secure property access described above |

## Reference

[1]: https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart "Google Analytics Data API quickstart"
