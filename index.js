const core = require('@actions/core');
const axios = require('axios');
const util = require('util');

async function run() {
  try {
    const userToken = core.getInput('user-token');
    const projectSlug = core.getInput('project-slug');
    const branch = core.getInput('branch');
    const definitionId = core.getInput('definition-id');
    const payload = core.getInput('payload');

    const jsonObj = JSON.parse(payload);

    // Parse the project slug to extract organization and project (GitHub only)
    const slugParts = projectSlug.split('/');
    if (slugParts.length !== 2) {
      throw new Error(`Invalid project slug format: ${projectSlug}. Expected format: org-name/repo-name`);
    }

    const [organization, project] = slugParts;

    // New API request payload structure
    const requestPayload = {
      definition_id: definitionId,
      config: {
        branch: branch
      },
      checkout: {
        branch: branch
      },
      parameters: jsonObj
    };

    let headers = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "Circle-Token": userToken,
      }
    };

    // Use the new API endpoint format (GitHub only)
    let url = util.format(
      'https://circleci.com/api/v2/project/gh/%s/%s/pipeline/run',
      organization,
      project
    );

    console.log(`Triggering pipeline for github/${organization}/${project} on branch ${branch}`);

    axios.post(url, requestPayload, headers)
      .then((res) => {
        console.log("Response: ", res.status);
        console.log("Response data: ", res.data);
      })
      .catch((err) => {
        console.log("HTTP Error: ", err.response?.data || err.message);
        core.setFailed(err.message);
      })

  } catch (error) {
    console.log("Error: ", error.message);
    core.setFailed(error.message);
  }
}

run();
