const debugFlagMessage =
  'Run the command again with the -l debug flag to see more.';

function couldNotGetEnvironment(accountSid, serviceSid, environmentSid) {
  return `Could not fetch asset service environment with config:

  Account Sid:     ${accountSid}
  Service Sid      ${serviceSid}
  Environment Sid: ${environmentSid}

  ${debugFlagMessage}`;
}

function couldNotGetBuild(serviceSid, environmentSid, buildSid) {
  return `Could not fetch last build of asset service environment with config:

  Service Sid:     ${serviceSid}
  Environment Sid: ${environmentSid}
  Build Sid:       ${buildSid}

  ${debugFlagMessage}`;
}

module.exports = {
  couldNotGetEnvironment,
  couldNotGetBuild,
  debugFlagMessage,
};
