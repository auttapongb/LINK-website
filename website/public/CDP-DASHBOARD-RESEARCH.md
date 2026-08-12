# CDP Admin Dashboard Research

Short notes from public vendor docs (2026) used to shape the LINK Admin CDP demo page (`cdp-admin.html`). Patterns only — no scraped proprietary UI assets.

## Shared product pattern

Enterprise CDPs converge on one operating loop:

**Sources / ingest → Unify (identity + profiles) → Segment (audiences) → Activate (destinations) → Measure (funnels, journeys, campaign KPIs)**

Admin UIs almost always expose:

| Surface | What operators see |
| --- | --- |
| KPI leaderboard | Profiles, audiences, sources, destinations (counts + freshness) |
| Left workspace nav | Connections / Profiles / Audiences / Destinations / Monitoring |
| Identity / profile | Unified person or account graph; related identifiers & events |
| Audiences | Named segments with size, rules, publish status |
| Destinations | Downstream systems with sync health |
| Monitoring | Source → profile → audience → destination pipeline health |
| Analytics | Funnels, journeys, retention / campaign performance |

## Vendor notes + sources

### Twilio Segment (Unify + Engage)

- Workspace left nav; **Connections** (sources/destinations) separate from **Unify** / **Engage**.
- Unify: profile sources, identity resolution, unified profiles; historical replay when connecting sources.
- Engage: audience builder, computed traits, destinations for activation.
- Docs: [Unify quickstart](https://www.twilio.com/docs/segment/unify/quickstart), [Engage quickstart](https://www.twilio.com/docs/segment/engage/quickstart), [Engage settings / destinations](https://www.twilio.com/docs/segment/engage/settings), [Linked Events / Data Graph](https://segment.com/docs/unify/data-graph/linked-events/)

### mParticle

- **Overview Map**: interactive diagram of inputs → platform suites (identity, profiles) → outputs / audiences.
- **IDSync** for deterministic identity; **Audiences** for real-time and warehouse-native (composable) segments; connect audiences to outputs.
- Docs: [Overview Map](https://docs.mparticle.com/guides/platform-guide/new-experience/overview-map/), [Audiences overview](https://docs.mparticle.com/guides/segmentation/audiences/)

### Adobe Real-Time CDP (Experience Platform)

- Home metrics dashboard: totals for schemas, datasets, profiles, audiences; “recent” datasets / sources / audiences / destinations.
- Getting-started arc: ingest → model → build audiences → send to destinations.
- **Monitoring** dashboard tracks journey Sources → Identity → Profile → Audiences → Destinations.
- Docs: [RT-CDP home & dashboards](https://experienceleague.adobe.com/en/docs/experience-platform/rtcdp/intro/rtcdp-intro/home-page-dashboards), [Monitoring dashboard](https://experienceleague.adobe.com/en/docs/experience-platform/dataflows/ui/monitor)

### Salesforce Data Cloud (Data 360)

- **Profile Explorer** for unified individual / account views.
- **Segments** built on data model objects, then **publish** to **activation targets** (Marketing Cloud, ads, files, etc.).
- Reports / dashboards for KPI visualization on DMOs and calculated insights.
- Docs: [Profile Explorer](https://help.salesforce.com/s/articleView?id=sf.c360_a_profile_explorer.htm&type=5), [Segments](https://help.salesforce.com/s/articleView?id=data.c360_a_segments.htm&type=5), [Activation](https://help.salesforce.com/s/articleView?id=data.c360_a_activation.htm&type=5), [Reports & dashboards](https://help.salesforce.com/s/articleView?id=data.datacloud_reports_dashboards_overview.htm&type=5)

### Treasure Data

- Operator **Control Panel** for security, settings, and **utilization** (engine / workflow usage) after CDP configuration — ops health beside marketing activation.
- Docs: [Control Panel](https://docs.treasure.ai/products/control-panel)

### Bloomreach Engagement

- Dashboards for project / campaign KPIs; **funnels** for multi-step conversion; **segmentations** with size and movement; **scenarios** as journey orchestration with evaluation metrics.
- Docs: [Dashboards](https://documentation.bloomreach.com/engagement/docs/dashboards-1), [Segmentations](https://documentation.bloomreach.com/engagement/docs/segmentations), [Scenarios](https://documentation.bloomreach.com/engagement/docs/introduction-to-scenarios), [Documentation overview](https://documentation.bloomreach.com/engagement/docs/documentation-overview)

## How LINK maps the pattern

| CDP stage | LINK Admin demo |
| --- | --- |
| Unify | Somsri household identity graph (Nan / Wit / Ploy + partner tokens) |
| Segment | Pilot audiences (e.g. Goal closers, Weekend burners) |
| Activate | Partner / CRM / ads destinations with sync status |
| Measure | Join → Earn → Pool → Goal → Burn funnel + journey timeline |
| Ops | Source health for Lotus’s, BTS, AIS, iBerry, IHG, web |

All figures on `cdp-admin.html` are **illustrative / simulated pilot data** for professor demo — not live production telemetry.
