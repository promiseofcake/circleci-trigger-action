const core = require('@actions/core');
const axios = require('axios');

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

    const headers = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "Circle-Token": userToken,
      }
    };

    // Use the new API endpoint format (GitHub only)
    const url = `https://circleci.com/api/v2/project/gh/${organization}/${project}/pipeline/run`;

    console.log(`Triggering pipeline for github/${organization}/${project} on branch ${branch}`);

    const response = await axios.post(url, requestPayload, headers);
    console.log("Response: ", response.status);
    console.log("Response data: ", response.data);
    return response;

  } catch (error) {
    if (error.response) {
      // HTTP error from axios
      console.log("HTTP Error: ", error.response?.data || error.message);
    } else {
      // Other error (JSON parsing, validation, etc.)
      console.log("Error: ", error.message);
    }
    core.setFailed(error.message);
    throw error;
  }
}

// Export the run function for testing
module.exports = { run };

// Only run if this file is executed directly (not imported)
if (require.main === module) {
  run();
}
