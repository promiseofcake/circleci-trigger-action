# promiseofcake/circleci-trigger-action

GitHub Action to trigger workflow runs via [CircleCI API](https://circleci.com/docs/api/v2/).

## Use-case

This action is for a very niche audience: individuals who are running workflows
in CircleCI but need to perform manual runs outside the scope of the provided /
available CircleCI triggering mechanisms.

One may ask, why would I use CircleCI if I am also using GitHub Actions? This
action does not aim to answer that question, but if you happen to be working in
that paradigm, hopefully it will be of use to you.

The main use cases are:

1. I have enabled "Only build Pull Requests" in CircleCI and I want to trigger builds on pushes to non-main/master branches
2. I need some way to manually kick-off a job on a given branch in CircleCI.

### Caveat

Since CircleCI already allows individuals to trigger builds on pushes in a pull request context, this action isn't strictly designed for that. If for some reason you want to do that, you will need to do the parsing and grokking of the branch name yourself from the [GitHub Context](https://docs.github.com/en/actions/learn-github-actions/contexts#github-context) as opposed to following the example below.

## Usage

Requirements:

* CircleCI User API Token (exposed as GitHub secret)
* CircleCI Configured Parameterized Workflow (configured on CircleCI)
* CircleCI Pipeline Definition ID (found in Project Settings > Pipelines)

See the sample Action config:

```yaml
name: Execute CircleCI Workflow

on:
    workflow_dispatch:

jobs:
  execute:
    runs-on: ubuntu-latest
    steps:
      - name: Capture triggering branch name
        run: echo "BRANCH_NAME=${GITHUB_REF#refs/heads/}" >> $GITHUB_ENV
      - name: Trigger CircleCI workflow
        uses: promiseofcake/circleci-trigger-action@v2
        with:
          user-token: ${{ secrets.CIRCLECI_TOKEN }}
          project-slug: ${{ github.repository }}
          branch: ${{ env.BRANCH_NAME }}
          definition-id: ${{ secrets.CIRCLECI_DEFINITION_ID }}
          payload: '{"run_output_workflow": true}'
```

For utility, see a sample CircleCI config (for the other side of this transaction)

```yaml
version: 2.1

parameters:
  run_output_workflow:
    type: boolean
    default: false

jobs:
  output:
    docker:
      - image: cimg/base:2023.08
    steps:
      - run: echo "this is an output build"

workflows:
  output:
    when: << pipeline.parameters.run_output_workflow >>
    jobs:
      - output
```

## Versioning

- `v1`: existing behavior; will continue to be supported for a period of time.
- `v2`: updated behavior using CircleCI's `pipeline/run` API and a required `definition-id` input.

We recommend pinning to a floating major tag like `@v2`. The floating `@v1` will continue to track the latest v1.x.y for now.

## Migrating from v1 to v2

1. Change your workflow reference to `uses: promiseofcake/circleci-trigger-action@v2`.
2. Add the new required input `definition-id` (find it in CircleCI Project Settings → Pipelines). Store it in a secret (e.g., `CIRCLECI_DEFINITION_ID`).
3. Ensure `project-slug` is exactly `org/repo` (you can use `${{ github.repository }}`).
4. Keep your `payload` JSON as-is to pass parameters to your CircleCI config.

Example snippet:

```yaml
uses: promiseofcake/circleci-trigger-action@v2
with:
  user-token: ${{ secrets.CIRCLECI_TOKEN }}
  project-slug: ${{ github.repository }}
  branch: ${{ github.ref_name }}
  definition-id: ${{ secrets.CIRCLECI_DEFINITION_ID }}
  payload: '{"run_output_workflow": true}'
```
