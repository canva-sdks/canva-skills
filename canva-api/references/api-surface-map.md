# API Surface Map: Canva REST API vs Apps SDK

## Overview

Canva exposes two distinct developer surfaces. They are **not interchangeable** and do not share capabilities. Choose based on where your code runs and what you need to do.

---

## Canva REST API (Connect APIs)

**What it is:** A set of authenticated HTTP endpoints for server-side integrations.

**Where your code runs:** Your backend server, not inside Canva.

**How authentication works:** OAuth 2.0 Authorization Code flow. Your server exchanges a code for an access token on behalf of a Canva user.

**What it can do (verify current scope in Canva.dev docs):**
- Upload and manage assets (images, videos)
- Create, list, and retrieve designs
- Export designs to PDF, PNG, JPEG, PPTX, MP4, and other formats
- Manage folders and organise content
- Receive events via webhooks
- Access brand templates

**What it cannot do:**
- Directly manipulate the live Canva editor (what the user sees on screen)
- Access or call Apps SDK JavaScript APIs
- Control in-editor UI elements

**Who uses it:** Backend engineers building integrations — DAM connectors, workflow automation, export pipelines, content management systems.

---

## Canva Apps SDK

**What it is:** A JavaScript SDK for building plugins (apps) that run inside the Canva editor.

**Where your code runs:** A browser iframe, embedded inside the Canva editor UI.

**How authentication works:** The SDK provides the current user's session context. OAuth is not required for basic in-editor operations.

**What it can do (verify in Apps SDK docs):**
- Read and manipulate the active design in the editor
- Add elements, text, images, and shapes to a design
- Interact with the user in real-time within the editor
- Display custom UI panels inside Canva
- Call out to external services from within the app

**What it cannot do:**
- Be called from a backend server via REST
- Export or download designs independently of the editor session
- Run headlessly or as a scheduled job

**Who uses it:** Developers building Canva Marketplace apps — in-editor tools, content integrations that surface inside the editor.

---

## Decision Matrix

| Requirement | Use |
|---|---|
| Export designs automatically from a backend | REST API |
| Upload brand assets from a DAM system | REST API |
| Trigger design creation from an external event | REST API |
| Receive notifications when a design is shared | REST API (webhooks) |
| Add content to a design while the user is editing | Apps SDK |
| Build an in-editor UI panel for your service | Apps SDK |
| Let users browse your content library inside Canva | Apps SDK |
| Manipulate the live editor canvas | Apps SDK |
| Authenticate server-to-server on behalf of a user | REST API |
| List or organise a user's designs from your app server | REST API |
| Both: let users pick content in-editor AND process it server-side | Both (Apps SDK calls your backend; backend calls REST API) |

---

## Using Both Together

Some integrations combine both surfaces:

1. The **Apps SDK app** provides an in-editor UI — the user selects content, configures options, or triggers an action.
2. The **Apps SDK app** calls your backend service with the relevant design ID or user context.
3. Your **backend** uses the REST API with a Canva OAuth access token to export, process, or store the result.

Even when using both, the surfaces remain separate. The Apps SDK does not give your backend server direct access to the editor state; the REST API does not give your in-editor app access to server-side REST endpoints without an explicit call.

---

## Common Mistakes

- **Assuming the REST API can edit an open design in real time.** It cannot — use the Apps SDK for live editor manipulation.
- **Assuming the Apps SDK can export designs directly.** Export is a REST API operation.
- **Treating OAuth scopes as relevant to Apps SDK in-editor operations.** Apps SDK uses session context, not OAuth scopes, for most in-editor operations.
- **Calling the REST API from browser/frontend code with a client secret.** The client secret must stay server-side.
