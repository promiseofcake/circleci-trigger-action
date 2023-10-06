const core = require('@actions/core');
const axios = require('axios');
const util = require('util');

async function run() {
  try {
    const userToken = core.getInput('user-token');
    const projectSlug = core.getInput('project-slug');
    const branch = core.getInput('branch');
    const payload = core.getInput('payload');

    const jsonObj = JSON.parse(payload)

    var requestPayload = {
      branch: branch,
      parameters: jsonObj
    };

    let headers = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "Circle-Token": userToken,
      }
    };

    let url = util.format(
      'https://circleci.com/api/v2/project/gh/%s/pipeline',
      projectSlug
    );

    axios.post(url, requestPayload, headers)
      .then((res) => {
        console.log("Response: ", res.status);
      })
      .catch((err) => {
        console.log("HTTP Error: ", err);
        core.setFailed(err.message);
      })

  } catch (error) {
    console.log("Error: ", error);
    core.setFailed(error.message);
  }
}

run();
