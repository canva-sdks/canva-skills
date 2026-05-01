# Workflow: Export Design

## Goal

Export a Canva design to a file (PDF, PNG, JPEG, PPTX, MP4, etc.) using the Exports API.

## When to use

Use this workflow when:
- A user wants to download a design as a specific file format
- Your integration needs to render a design for external use (print, email, archival, etc.)
- You are building an automated export pipeline

## Docs to read first

Fetch these before writing any export code:
- `https://www.canva.dev/docs/connect/api-reference/exports.md` — overview, supported formats, format compatibility per design type
- `https://www.canva.dev/docs/connect/api-reference/exports/create-design-export-job.md` — exact endpoint, request fields, required scopes
- `https://www.canva.dev/docs/connect/api-reference/exports/get-design-export-job.md` — polling endpoint, job status values, response shape, download URL location

Also read:
- `https://www.canva.dev/docs/connect/appendix/scopes.md` — verify the required scope for exports

## Prerequisites

- Valid Canva access token with the required export scope (verify in `scopes.md`)
- A design ID (e.g. `DABcd1234ef`)

## Recommended Approach

Exports are **asynchronous**. The flow is:

1. **Create export job**: POST to the export job endpoint with the design ID and desired format. Receive a job ID.
2. **Poll for completion**: GET the export job status at intervals until the status indicates success or failure.
3. **Download the file**: When the job is complete, the response contains a download URL. Fetch it.

Do not attempt to download the file synchronously — the export job may take seconds to minutes depending on design complexity.

## TypeScript Pattern

Read the docs linked above for exact endpoint paths, request field names, status values, and response shapes. Fill in the TODOs before using.

```typescript
import { CanvaClient, CanvaApiError } from './canva-client'; // copy from examples/node/canva-client.md

type ExportFormat = 'pdf' | 'png' | 'jpg' | 'pptx' | 'mp4' | 'gif';
// TODO: verify the exact format values accepted by the API from create-design-export-job.md

async function exportDesign(
  accessToken: string,
  designId: string,
  format: ExportFormat
): Promise<string> {
  const client = new CanvaClient(accessToken);

  // Step 1: Create export job
  // TODO: replace endpoint path and request body fields with values from create-design-export-job.md
  const job = await client.post<{ job: { id: string } }>(
    '/TODO_EXPORT_JOB_ENDPOINT',
    {
      design_id: designId,
      format: { type: format },
      // TODO: add any other required fields from the docs
    }
  );

  const jobId = job.job.id;

  // Step 2: Poll until done
  // TODO: replace endpoint path and status field names with values from get-design-export-job.md
  return await pollExportJob(client, jobId);
}

async function pollExportJob(client: CanvaClient, jobId: string): Promise<string> {
  const MAX_POLLS = 30;
  const POLL_INTERVAL_MS = 3000;

  for (let i = 0; i < MAX_POLLS; i++) {
    await sleep(POLL_INTERVAL_MS);

    // TODO: replace endpoint path with value from get-design-export-job.md
    const result = await client.get<{
      job: {
        status: string; // TODO: verify status values from docs (e.g. 'success', 'failed', 'in_progress')
        urls?: string[];   // TODO: verify download URL field name from docs
      };
    }>(`/TODO_EXPORT_JOB_STATUS_ENDPOINT/${jobId}`);

    const { status, urls } = result.job;

    if (status === 'TODO_SUCCESS_STATUS') {
      if (!urls || urls.length === 0) throw new Error('Export completed but no download URL returned');
      return urls[0];
    }

    if (status === 'TODO_FAILED_STATUS') {
      throw new Error(`Export job failed`);
    }

    // Continue polling if status is in-progress
  }

  throw new Error('Export job timed out');
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

## Common Mistakes

- **Treating exports as synchronous**: always poll — never assume the job is done immediately.
- **Using an unsupported format for the design type**: not all formats work for all design types. Check the format compatibility matrix in `exports.md`.
- **Polling too aggressively**: use a reasonable interval (e.g. 2–5 seconds). Rapid polling causes 429 errors.
- **Not handling job failure status**: always check for failure, not just success.
- **Not reading the docs for exact field names**: field names for the request body, status values, and URL field in the response must come from the docs.

## Troubleshooting

- **400**: check request body fields against `create-design-export-job.md`. The format type value may be wrong.
- **403**: verify the access token has the required export scope. Check `scopes.md`.
- **404**: verify the design ID is correct and the authenticated user has access to it.
- **429 during polling**: increase the poll interval and add exponential backoff.
- **Job stuck in-progress**: implement a timeout and surface the error rather than polling indefinitely.

See `references/troubleshooting.md` for the full error map.

## Production Notes

- Store job IDs persistently — if your server restarts mid-export, you can resume polling.
- Set a maximum poll count or overall timeout rather than polling indefinitely.
- For high-volume exports, implement a queue (e.g. BullMQ, SQS) rather than blocking a request handler.
- Cache export URLs if Canva provides them for a known TTL — check `get-design-export-job.md` for URL expiry details.
