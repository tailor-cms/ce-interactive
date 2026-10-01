# Interactive

Interactive content element: a self-contained HTML page (visualization,
simulation, small explorable) stored as one file and run in a sandboxed frame.
Pages can be uploaded by authors or written by Tailor's AI assistant.

**Type:** `INTERACTIVE`

## Data

| Field | Type | Description |
|-------|------|-------------|
| `url` | `string \| null` | Public URL of the page, resolved from `assets.url` on read |
| `assets.url` | `string?` | `storage://` reference to the stored HTML file |
| `title` | `string?` | Frame title for assistive tech; taken from the page's `<title>` on upload |
| `description` | `string?` | One-sentence text alternative |
| `height` | `number` | Starting height in px, and the height of pages that don't report theirs (default 480) |

## Development

```sh
pnpm dev     # Preview :8080 | Edit :8010 | Display :8020 | Server :8030
pnpm build
pnpm lint
pnpm test    # needs `pnpm dev` running
```

## Run with Docker

```sh
docker compose up
```
