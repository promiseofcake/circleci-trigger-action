# promiseofcake/circleci-trigger-action

Github Action to trigger workflow runs via [API call in CircleCi](https://circleci.com/docs/api/v2/#get-a-pipeline-39-s-workflows).

## Use-case

This action is for a very niche-audience, individuals who are running workflows
in CircleCI but need to perform manual runs outside the scope of the provided /
avaialble CircleCI triggering mechanisms.

One may ask, why would I use CircleCi if I am also using Github Actions? This
action does not aim to answer that question, but if you happen to be working in
that paradigm, hopefuly it will be of use to you.

## Usage

Requirements:

- CircleCI User API Token
- CircleCI Configured Parameterized Workflow

See the sample Action config:

```yaml
name: Execute CircleCI Workflow

jobs:
  execute:
    runs-on: ubuntu-latest
    steps:
      - run: echo "BRANCH_NAME=${GITHUB_REF#refs/heads/}" >> $GITHUB_ENV
      - uses: promiseofcake/circleci-trigger-action@v1
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
      - image: cimg/base:2020.01
    steps:
      - run: echo "this is an output build"

workflows:
  output:
    when: << pipeline.parameters.run_output_workflow >>
    jobs:
      - output
```
