---
name: canva-cli
description: Use the Canva CLI (`canva api`) for Canva REST API workflows with
  local files, scripts, and coding agents. Use when the request needs direct,
  programmatic work with Canva designs, folders, assets, exports, or other REST
  API resources.
---

# Canva CLI

Use the Canva CLI when a request requires direct, programmatic interaction with
Canva or local files. Do not use it for purely conversational design work that
is better handled through Canva's AI-assisted workflows.

## Set up the CLI when needed

Before using the CLI, check whether `canva --version` succeeds.

If the CLI is unavailable, explain that it requires Node.js v24 and npm v11.
Install it only when the user has explicitly requested or approved installation:

```sh
npm install -g @canva/cli@latest
```

Before accessing Canva resources, ensure the intended user is logged in:

```sh
canva login
```

Login opens a browser authorization flow and requires the user to approve
access. In a remote or headless environment, use canva login --mode manual.
Do not request, print, inspect, or copy the locally stored auth token.
When multiple Canva accounts are relevant, require the user to identify the
intended profile before running commands against it. Use --profile <name> for
a one-off command rather than changing the active profile unless the user asks
to switch it.

## Find the right operation

Do not guess commands, flags, or request shapes.

- Start with `canva api --help`, then narrow by resource group.
- Use `canva api <group> <command> --help` to inspect flags.
- Use `canva api describe <group> <command>` when the command contract is
  needed as JSON.
- CLI commands follow REST API operation names, not URL paths.
- Prefer documented flags. Use `--body @file.json` only when a nested JSON
  payload cannot be expressed with flags.

## Authenticate and validate

- Commands act as the logged-in Canva account. Run `canva login` when needed.
- If a request returns `MISSING_SCOPE`, log in again before retrying.
- Before a command that creates, changes, or uploads content, run it with
  `--dry-run` when available to validate its arguments and login without making
  the API request.
- Ensure the target design, folder, asset, or other resource is unambiguous
  before making a state-changing request.

## Interpret results

When a request reaches the API, the CLI returns one JSON object on standard
output.

- Check `ok` before treating a request as successful.
- On success, use `data` for the API response.
- On failure, report `error.code`, `error.message`, and relevant
  `meta.status`; do not invent a recovery.
- Consider `next` as a possible follow-up, such as logging in, but verify the
  suggested command is appropriate before running it.
- If invalid arguments or unknown flags produce a usage error, consult
  `--help` rather than retrying with guessed flags.

## Handle asynchronous operations

Some operations, including asset uploads, return a job instead of a completed
resource.

- Save the returned job ID.
- Poll the corresponding “Get job” command after a short delay.
- While the status is `in_progress`, use exponential backoff between polls:
  increase the wait after each unsuccessful poll, respect the endpoint’s rate
  limits, and never issue concurrent or tight-loop polls.
- Stop polling immediately when the job becomes `success` or `failed`.
- On success, return the resulting resource ID and useful links.
- On failure, return the job error and stop; do not retry the original request
  unless the user asks.
- If the job remains in progress beyond the available task time, report its job
  ID and latest status so it can be checked again later.

## Report back

Summarize the action, exact target, result, and useful IDs or Canva URLs.
Never include credentials, access tokens, or unnecessary raw response data.

## Reference

- [Canva CLI](https://www.canva.dev/docs/apps/canva-cli/) — installation,
  authentication, profiles, and app-development commands.
- [Making REST API requests from the CLI](https://www.canva.dev/docs/apps/canva-cli/making-rest-api-requests/) —
  `canva api` command discovery, inputs, response format, and async jobs.