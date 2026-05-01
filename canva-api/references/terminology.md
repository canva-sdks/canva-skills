# Terminology

Common terms in the Canva developer ecosystem. Use these definitions for consistency in answers.

---

**Canva REST API**
The set of authenticated HTTP endpoints Canva provides for server-side integrations. Also referred to as the Connect APIs. Used to manage assets, designs, exports, folders, and webhooks from backend code. Documented at `https://www.canva.dev/docs/connect/`.

**Canva Connect APIs**
Canva's own name for the Canva REST API. The terms are interchangeable. "Connect APIs" is the branding Canva uses in its developer documentation.

**Canva Apps SDK**
A JavaScript SDK for building plugins (apps) that run inside the Canva editor as browser iframes. Separate from the REST API. Documented at `https://www.canva.dev/docs/apps/`. In-editor operations use the Apps SDK; server-side integrations use the REST API.

**App**
In the Canva developer context: an integration or plugin registered in the Canva Developer Portal. An app has a client ID, optional client secret, and configured OAuth redirect URIs. May use the REST API, the Apps SDK, or both, depending on what it does.

**Integration**
A server-side connection between an external system and Canva via the REST API. Typically authenticates on behalf of a Canva user via OAuth. Examples: a DAM connector, an export pipeline, a workflow automation tool.

**Client ID**
A public identifier for your app, issued by Canva when you register an app in the Developer Portal. Included in OAuth authorization requests. Safe to include in URLs and logs.

**Client Secret**
A private credential paired with the client ID. Used to authenticate your backend during the OAuth token exchange. Must never leave your server — not in frontend code, browser requests, or logs.

**Redirect URI**
The URL Canva sends the user back to after they authorize your app. Must be registered in the Developer Portal. Canva will reject OAuth flows using unregistered redirect URIs.

**Authorization Code**
A short-lived, single-use code returned to your redirect URI after the user grants permission. Your backend exchanges it for an access token and refresh token. It expires quickly — exchange it immediately.

**Access Token**
A credential your backend includes in the `Authorization: Bearer <token>` header to authenticate REST API requests on behalf of a user. Has a limited lifetime. Do not log.

**Refresh Token**
A longer-lived credential used to obtain a new access token when the current one expires, without requiring the user to re-authorize. Must be stored securely server-side. Do not log.

**Scope**
A permission that controls what an access token can do. Scopes are requested during the OAuth authorization flow. Examples (verify current names at `https://www.canva.dev/docs/connect/appendix/scopes.md`): design reading, asset creation, folder management. Prefer least-privilege — only request scopes you use.

**Design**
A Canva creation — a document, presentation, social post, etc. Identified by a design ID (e.g., `DABcd1234ef`). Accessible via the Designs API. The REST API can create, read, and export designs, but cannot directly edit design content in the editor.

**Asset**
A media file (image, video, etc.) uploaded to Canva via the Assets API. Assets can be used in designs. Uploads are processed asynchronously via an upload job.

**Export**
The process of rendering a Canva design to a downloadable file format (PDF, PNG, JPEG, PPTX, MP4, etc.) via the Exports API. Exports are asynchronous — you create an export job and poll for its completion.

**Webhook**
An HTTP callback that Canva sends to your endpoint when a specific event occurs (e.g., a design is shared, a comment is added). Configured via the Canva Developer Portal or API. Your endpoint must be publicly accessible and, if Canva provides a signing mechanism, must verify the signature.

**Developer Portal**
The web interface at `https://www.canva.com/developers/` where you register apps, manage OAuth settings (client IDs, secrets, redirect URIs), configure webhooks, and submit apps for review.
