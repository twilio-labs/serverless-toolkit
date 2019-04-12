import debug from 'debug';
import { VariableList, VariableResource } from '../serverless-api-types';
import { EnvironmentVariables, GotClient, Variable } from '../types';

const log = debug('twilio-serverless-api/variables');

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

async function getVariablesForEnvironment(
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

export async function setEnvironmentVariables(
  envVariables: EnvironmentVariables,
  environmentSid: string,
  serviceSid: string,
  client: GotClient
): Promise<void> {
  const existingVariables = await getVariablesForEnvironment(
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
