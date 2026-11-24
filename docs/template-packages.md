# Template packages

`frontend/src/templates/registry.ts` resolves `{ id, version }` from `PageSchema.template`.
`PageRenderer` dispatches to the package and rejects unsupported blocks or versions.
It does not prescribe width, fonts, backgrounds, envelope behavior or a global block registry.

Each package owns its renderer, styles, supported blocks, editor fields, font choices and
personalization function. The registry includes HB04 v1, Minimalism v1 and v2, Song Hy Green v1, and DS03 v1.
HB04 and Minimalism's shared guestbook form use `useGuestbook`. The newer Minimalism layout
adapts its own form through the same hook. Song Hy Green uses its own adapter to the public
wish API. Its RSVP form saves `ATTENDING` or `DECLINED`, and its standalone guestbook
form saves messages as `MAYBE` with a guest count of 1.

## Adding a design

1. Create a package directory with `index.ts`, renderer, styles and personalization.
2. Declare unique package id, renderer version, invitation kind, fields, supported blocks,
   fonts and nominal width. Field keys belong to the package; they need not be wedding fields.
3. Register the package in `registry.ts`. New layouts can define their own block names.
4. Add default template data and a backend seed carrying an explicit `schema.template` binding.
   Store media in MinIO using versioned object keys; do not overwrite assets used by published invitations.
5. Validate personalization without mutating defaults, visual layout and real API interactions.

`TemplateControls` renders package fields and supports section visibility/order, primary
color, background, heading font and music. The selected package applies the data to its
own schema; the create page has no template-specific block mapping.

## Compatibility and publishing

Existing schemas without a binding resolve through the explicit legacy adapter: the old
`MINIMALISM_DARK_RED` marker selects Minimalism v1; older schemas select HB04 v1.
The Quick Create page sends a full personalized schema with an explicit renderer binding.
An unknown pinned version displays an error instead of silently rendering another design.
When changing a published layout incompatibly, keep its old renderer and register a new
version; a version number alone cannot preserve old output if its renderer or assets are overwritten.

Creation and preview prefer the backend template and fall back to bundled data for known templates.
The public page tries the API, a matching localStorage entry, then a matching bundled template ID.
If none supplies a schema, it displays an invitation-not-found message.

The current publishing API still accepts wedding data. The package/editor contract supports
other invitation kinds, but publishing birthdays or business events will require a suitable
backend payload and validation. Free canvas editing is not implemented; current packages
support stacked sections. Adding JSON properties alone does not implement a layout engine.

## Verification

```powershell
cd frontend
npx tsc --noEmit
node scripts/test-template-packages.cjs
```

Browser verification covers creation, persisted renderer binding, independent ceremony/banquet
updates, public rendering at 320/375/430px, and persisted RSVP/wishes.
Visual fidelity is a separate acceptance check: compare source and local screenshots with
the same content, viewport, fonts loaded, scroll position and envelope/dialog state.
Check envelope opening, family/ceremony, album, banquet/calendar, guestbook and gifts separately.
Passing functional tests does not establish a 1:1 visual match.

## DS03 runtime

DS03 mounts the captured invitation components and styles inside a sandboxed frame. The
package keeps the 960 px desktop design and scales it to fit narrower containers. The frame
scrolls independently so the captured scroll-driven behavior and overlays operate inside it.
The editor stores only personalized fields and the `ds03@1` binding. The host uses the public
invitation API for submissions and passes only the data that the frame needs.

The versioned runtime is stored in MinIO (`wedding-media/templates/ds03-sang-trong/runtime/v1`) and served through Next.js rewrites at `/templates/ds03-sang-trong/runtime/v1`. To rebuild and upload it from the verified DS03 extraction, run `node frontend/scripts/import-ds03-runtime.cjs` from the repository root. The input includes `manifest.json` and `extraction-verification.json`. The script checks captured payload hashes and uploads the template's public data, static assets, and runtime adapters.

`node frontend/scripts/test-ds03-browser.mjs` uses a running Chrome debug session, frontend
and backend to check the catalog template at desktop and mobile widths. Add `--publish` to
create a local test invitation and verify persisted responses. See the resulting screenshots
and report under `extracted_templates/browser-check/ds03-integration`.
