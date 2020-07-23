const core = require('@actions/core');
const axios = require('axios');
const util = require('util');

async function run() {
  try {
    const branch = core.getInput('branch');
    const payload = core.getInput('payload');
    const platform = core.getInput('platform');
    const repository = core.getInput('repository');
    const token = core.getInput('token');

    const jsonObj = JSON.parse(payload)

    var requestPayload = {
      branch: branch,
      parameters: jsonObj
    };

    let headers = {
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          "Circle-Token": token,
      }
    };

    let url = util.format(
      'https://circleci.com/api/v2/project/%s/%s/pipeline',
      platform,
      repository
    );

    axios.post(url, requestPayload, headers)
    .then((res) => {
      console.log("RESPONSE: ", res);
    })
    .catch((err) => {
      console.log("ERROR: ", err);
      throw err;
    })

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
