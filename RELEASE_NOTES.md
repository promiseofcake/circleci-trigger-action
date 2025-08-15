# circleci-trigger-action v2.0.0 — Release Notes

These notes summarize the changes landing with the v2 major release.

## Summary

- Action is now aligned to CircleCI's newer pipeline/run API.
- A new required input, `definition-id`, selects the pipeline definition to run.
- Improved validation and error messages.
- Floating tags will be maintained per major (e.g., `v1`, `v2`).

## Breaking changes

- New required input: `definition-id`
  - Obtain in CircleCI: Project Settings → Pipelines → Pipeline Definition ID.
  - Store as a secret (e.g., `CIRCLECI_DEFINITION_ID`).
- `project-slug` must be `org/repo` (no `gh/` prefix). For GitHub-hosted projects, `${{ github.repository }}` is recommended.
- The action targets Node 20 on the runner (no config change needed for typical use).

## What's new

- Uses the CircleCI pipeline/run endpoint and sends parameters, branch, and definition id in a structured payload.
- Better error output (HTTP status and response when available).
- README updates with migration steps and clearer examples.

## Migration (v1 → v2)

1. Update your workflow reference:

```yaml
uses: promiseofcake/circleci-trigger-action@v2
```

2. Add the required input `definition-id` and keep your `payload` JSON:

```yaml
with:
  user-token: ${{ secrets.CIRCLECI_TOKEN }}
  project-slug: ${{ github.repository }}      # org/repo
  branch: ${{ github.ref_name }}
  definition-id: ${{ secrets.CIRCLECI_DEFINITION_ID }}
  payload: '{"run_output_workflow": true}'
```

3. Ensure `project-slug` is exactly `org/repo`.

## Continued support for v1

- The `v1` major will continue to be supported for a period of time. Pin `@v1` to remain on the legacy behavior while planning your migration.
- We recommend moving to `@v2` to benefit from the latest API and improvements.

## Versioning and floating tags

- Floating tags `v<major>` (e.g., `v1`, `v2`) point to the latest release in that major line.
- Publishing a new stable release automatically moves the corresponding floating tag.

---
If you run into issues or have migration questions, please open an issue.
