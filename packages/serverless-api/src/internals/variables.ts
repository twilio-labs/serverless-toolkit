import debug from 'debug';
import {
  EnvironmentVariables,
  GotClient,
  Variable,
  VariableList,
  VariableResource,
} from '../types';

const log = debug('twilio-serverless-api:variables');

/**
 * Creates a new environment variable for a given environment
 *
 * @param {string} key the name of the variable
 * @param {string} value the value of the variable
 * @param {string} environmentSid the environment the variable should be created for
 * @param {string} serviceSid the service that the environment belongs to
 * @param {GotClient} client API client
 * @returns {Promise<VariableResource>}
 */
async function registerVariableInEnvironment(
  key: string,
  value: string,
  environmentSid: string,
  serviceSid: string,
  client: GotClient
): Promise<VariableResource> {
  try {
    const resp = await client.post(
      `/Services/${serviceSid}/Environments/${environmentSid}/Variables`,
      {
        form: true,
        body: {
          Key: key,
          Value: value,
        },
      }
    );
    return (resp.body as unknown) as VariableResource;
  } catch (err) {
    log('%O', err);
    throw err;
  }
}

/**
 * Given the SID of a variable it will update the name and value of the variable
 *
 * @param {string} key the name of the variable
 * @param {string} value the value of the variable
 * @param {string} variableSid the SID of the existing variable
 * @param {string} environmentSid the environment the variable belongs to
 * @param {string} serviceSid the service the environment belongs to
 * @param {GotClient} client API client
 * @returns {Promise<VariableResource>}
 */
async function updateVariableInEnvironment(
  key: string,
  value: string,
  variableSid: string,
  environmentSid: string,
  serviceSid: string,
  client: GotClient
): Promise<VariableResource> {
  try {
    const resp = await client.post(
      `/Services/${serviceSid}/Environments/${environmentSid}/Variables/${variableSid}`,
      {
        form: true,
        body: {
          Key: key,
          Value: value,
        },
      }
    );
    return (resp.body as unknown) as VariableResource;
  } catch (err) {
    log('%O', err);
    throw err;
  }
}

/**
 * Lists all variables for a given environment
 *
 * @export
 * @param {string} environmentSid the environment to get the variables for
 * @param {string} serviceSid the service the environment belongs to
 * @param {GotClient} client API client
 * @returns {Promise<VariableResource[]>}
 */
export async function listVariablesForEnvironment(
  environmentSid: string,
  serviceSid: string,
  client: GotClient
): Promise<VariableResource[]> {
  try {
    const resp = await client.get(
      `/Services/${serviceSid}/Environments/${environmentSid}/Variables`
    );
    const { variables } = (resp.body as unknown) as VariableList;
    return variables;
  } catch (err) {
    log('%O', err);
    throw err;
  }
}

/**
 * Convers an object of environment variables into an array of key-value pairs
 *
 * @param {EnvironmentVariables} env the object of environment variables
 * @returns {Variable[]}
 */
function convertToVariableArray(env: EnvironmentVariables): Variable[] {
  const output: Variable[] = [];

  Object.keys(env).forEach(key => {
    const value = env[key];
    if (typeof value === 'string' || typeof value === 'number') {
      output.push({ key, value: `${value}` });
    }
  });

  return output;
}

/**
 * Sets or updates the values passed in an object of environment variables for a specfic environment
 *
 * @export
 * @param {EnvironmentVariables} envVariables the object of variables
 * @param {string} environmentSid the environment the varibales should be set for
 * @param {string} serviceSid the service the environment belongs to
 * @param {GotClient} client API client
 * @returns {Promise<void>}
 */
export async function setEnvironmentVariables(
  envVariables: EnvironmentVariables,
  environmentSid: string,
  serviceSid: string,
  client: GotClient
): Promise<void> {
  const existingVariables = await listVariablesForEnvironment(
    environmentSid,
    serviceSid,
    client
  );
  const variables = convertToVariableArray(envVariables);

  const variableResources = variables.map(variable => {
    const existingResource = existingVariables.find(
      res => res.key === variable.key
    );
    if (!existingResource) {
      return registerVariableInEnvironment(
        variable.key,
        variable.value,
        environmentSid,
        serviceSid,
        client
      );
    }

    if (existingResource.value === variable.value) {
      return Promise.resolve(existingResource);
    }

    return updateVariableInEnvironment(
      variable.key,
      variable.value,
      existingResource.sid,
      environmentSid,
      serviceSid,
      client
    );
  });

  await Promise.all(variableResources);
}
