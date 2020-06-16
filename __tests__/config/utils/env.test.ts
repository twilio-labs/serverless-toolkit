import { filterEnvVariablesForDeploy } from '../../../src/config/utils/env';
import { EnvironmentVariablesWithAuth } from '../../../src/types/generic';

describe('filterEnvVariablesForDeploy', () => {
  const testVars: EnvironmentVariablesWithAuth = {
    ACCOUNT_SID: 'ACCOUNT_SID',
    AUTH_TOKEN: 'AUTH_TOKEN',
    empty: '',
    hello: 'world',
  };

  it('deletes ACCOUNT_SID and AUTH_TOKEN', () => {
    const deployVars = filterEnvVariablesForDeploy(testVars);
    expect(deployVars['ACCOUNT_SID']).toBeUndefined();
    expect(deployVars['AUTH_TOKEN']).toBeUndefined();
  });

  it('deletes empty env vars', () => {
    const deployVars = filterEnvVariablesForDeploy(testVars);
    expect(deployVars['empty']).toBeUndefined();
  });

  it('leaves other variables as they were', () => {
    const deployVars = filterEnvVariablesForDeploy(testVars);
    expect(deployVars['hello']).toEqual('world');
  });
});
