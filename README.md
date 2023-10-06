# promiseofcake/circleci-trigger-action

Github Action to trigger workflow runs via [API call in CircleCI](https://circleci.com/docs/api/v2/#get-a-pipeline-39-s-workflows).

## Use-case

This action is for a very niche-audience, individuals who are running workflows
in CircleCI but need to perform manual runs outside the scope of the provided /
avaialble CircleCI triggering mechanisms.

One may ask, why would I use CircleCI if I am also using Github Actions? This
action does not aim to answer that question, but if you happen to be working in
that paradigm, hopefuly it will be of use to you.

The main use cases are:

1. I have enabled "Only build Pull Requests" in CircleCI and I want to trigger builds on pushes to non-main/master branches
2. I need some way to manually kick-off a job on a given branch in CircleCI.

### Caveat

Since CircleCI already allows individuals to trigger builds on pushes in a pull request context, this action isn't strictly designed for that. If for some reason you want to do that, you will need to do the parsing and groking of the branch name yourself from the [Github Context](https://docs.github.com/en/free-pro-team@latest/actions/reference/context-and-expression-syntax-for-github-actions#github-context) as opposed to following the example below.

## Usage

Requirements:

* CircleCI User API Token (exposed as GitHub secret)
* CircleCI Configured Parameterized Workflow (configured on CircleCI)

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
      - name: Trigger CircleCI build-beta workflow.
        uses: promiseofcake/circleci-trigger-action@v1
        with:
          user-token: ${{ secrets.CIRCLECI_TOKEN }}
          project-slug: promiseofcake/circleci-trigger-action
          branch: ${{ env.BRANCH_NAME }}
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
