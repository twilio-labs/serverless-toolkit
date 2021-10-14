/** @module @twilio-labs/serverless-api/dist/api */

import debug from 'debug';
import { TwilioServerlessApiClient } from '../client';
import {
  EnvironmentVariables,
  Sid,
  Variable,
  VariableList,
  VariableResource,
} from '../types';
import { ClientApiError } from '../utils/error';
import { getPaginatedResource } from './utils/pagination';
import { isSid } from './utils/type-checks';

const log = debug('twilio-serverless-api:variables');

/**
 * Creates a new environment variable for a given environment
 *
 * @param {string} key the name of the variable
 * @param {string} value the value of the variable
 * @param {string} environmentSid the environment the variable should be created for
 * @param {string} serviceSid the service that the environment belongs to
 * @param {TwilioServerlessApiClient} client API client
 * @returns {Promise<VariableResource>}
 */
async function registerVariableInEnvironment(
  key: string,
  value: string,
  environmentSid: string,
  serviceSid: string,
  client: TwilioServerlessApiClient
): Promise<VariableResource> {
  try {
    const resp = await client.request(
      'post',
      `Services/${serviceSid}/Environments/${environmentSid}/Variables`,
      {
        form: {
          Key: key,
          Value: value,
        },
      }
    );
    return (resp.body as unknown) as VariableResource;
  } catch (err) {
    log('%O', new ClientApiError(err));
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
 * @param {TwilioServerlessApiClient} client API client
 * @returns {Promise<VariableResource>}
 */
async function updateVariableInEnvironment(
  key: string,
  value: string,
  variableSid: string,
  environmentSid: string,
  serviceSid: string,
  client: TwilioServerlessApiClient
): Promise<VariableResource> {
  try {
    const resp = await client.request(
      'post',
      `Services/${serviceSid}/Environments/${environmentSid}/Variables/${variableSid}`,
      {
        form: {
          Key: key,
          Value: value,
        },
      }
    );
    return (resp.body as unknown) as VariableResource;
  } catch (err) {
    log('%O', new ClientApiError(err));
    throw err;
  }
}

/**
 * Lists all variables for a given environment
 *
 * @export
 * @param {string} environmentSid the environment to get the variables for
 * @param {string} serviceSid the service the environment belongs to
 * @param {TwilioServerlessApiClient} client API client
 * @returns {Promise<VariableResource[]>}
 */
export async function listVariablesForEnvironment(
  environmentSid: string,
  serviceSid: string,
  client: TwilioServerlessApiClient
): Promise<VariableResource[]> {
  try {
    return getPaginatedResource<VariableList, VariableResource>(
      client,
      `Services/${serviceSid}/Environments/${environmentSid}/Variables`
    );
  } catch (err) {
    log('%O', new ClientApiError(err));
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

  Object.keys(env).forEach((key) => {
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
 * @param {TwilioServerlessApiClient} client API client
 * @param {boolean} [removeRedundantOnes=false] whether to remove variables that are not passed but are currently set
 * @returns {Promise<void>}
 */
export async function setEnvironmentVariables(
  envVariables: EnvironmentVariables,
  environmentSid: string,
  serviceSid: string,
  client: TwilioServerlessApiClient,
  removeRedundantOnes: boolean = false
): Promise<void> {
  const existingVariables = await listVariablesForEnvironment(
    environmentSid,
    serviceSid,
    client
  );
  const variables = convertToVariableArray(envVariables);

  const variableResources = variables.map((variable) => {
    const existingResource = existingVariables.find(
      (res) => res.key === variable.key
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

  if (removeRedundantOnes) {
    const removeVariablePromises = existingVariables.map(async (variable) => {
      if (typeof envVariables[variable.key] === 'undefined') {
        return deleteEnvironmentVariable(
          variable.sid,
          environmentSid,
          serviceSid,
          client
        );
      }
    });
    await Promise.all(removeVariablePromises);
  }
}

/**
 * Deletes a given variable from a given environment
 *
 * @export
 * @param {string} variableSid the SID of the variable to delete
 * @param {string} environmentSid the environment the variable belongs to
 * @param {string} serviceSid the service the environment belongs to
 * @param {TwilioServerlessApiClient} client API client instance
 * @returns {Promise<boolean>}
 */
export async function deleteEnvironmentVariable(
  variableSid: string,
  environmentSid: string,
  serviceSid: string,
  client: TwilioServerlessApiClient
): Promise<boolean> {
  try {
    const resp = await client.request(
      'delete',
      `Services/${serviceSid}/Environments/${environmentSid}/Variables/${variableSid}`
    );
    return true;
  } catch (err) {
    log('%O', new ClientApiError(err));
    throw err;
  }
}

/**
 * Deletes all variables matching the passed keys from an environment
 *
 * @export
 * @param {string[]} keys the keys of the variables to delete
 * @param {string} environmentSid the environment the variables belong to
 * @param {string} serviceSid the service the environment belongs to
 * @param {TwilioServerlessApiClient} client API client instance
 * @returns {Promise<boolean>}
 */
export async function removeEnvironmentVariables(
  keys: string[],
  environmentSid: string,
  serviceSid: string,
  client: TwilioServerlessApiClient
): Promise<boolean> {
  const existingVariables = await listVariablesForEnvironment(
    environmentSid,
    serviceSid,
    client
  );

  const variableSidMap = new Map<string, Sid>();
  existingVariables.forEach((variableResource) => {
    variableSidMap.set(variableResource.key, variableResource.sid);
  });

  const requests: Promise<boolean>[] = keys.map((key) => {
    const variableSid = variableSidMap.get(key);
    if (isSid(variableSid)) {
      return deleteEnvironmentVariable(
        variableSid,
        environmentSid,
        serviceSid,
        client
      );
    }
    return Promise.resolve(true);
  });

  await Promise.all(requests);
  return true;
}
