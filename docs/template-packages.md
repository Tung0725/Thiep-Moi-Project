# Template packages

`frontend/src/templates/registry.ts` resolves `{ id, version }` from `PageSchema.template`.
`PageRenderer` dispatches to the package and rejects unsupported blocks or versions.
It does not prescribe width, fonts, backgrounds, envelope behavior or a global block registry.

Each package owns its renderer, styles, supported blocks, editor fields, font choices and
personalization function. HB04 owns its existing blocks and opening envelope. Minimalism
owns its renderer, scoped CSS and guestbook presentation. Both use `useGuestbook` for API
access and form state. Music and particle behavior remain shared optional components.

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
New invitations save a full personalized schema with an explicit renderer binding.
An unknown pinned version displays an error instead of silently rendering another design.
When changing a published layout incompatibly, keep its old renderer and register a new
version; a version number alone cannot preserve old output if its renderer or assets are overwritten.

Creation and preview load the backend template; bundled data is a development fallback
for known templates. Public links that do not exist no longer display an unrelated default.

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
