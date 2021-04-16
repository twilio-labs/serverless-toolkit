jest.mock('../../../src/config/utils/package-json');
jest.mock('../../../src/commands/utils');

import { deprecateProjectName } from '../../../src/commands/utils';
import { readPackageJsonContent } from '../../../src/config/utils/package-json';
import { getServiceNameFromFlags } from '../../../src/config/utils/service-name';

const baseFlags = {
  config: '.twilioserverlessrc',
  logLevel: 'info' as 'info',
};

describe('getServiceNameFromFlags', () => {
  beforeEach(() => {
    require('../../../src/config/utils/package-json').__setPackageJson({});
  });

  test('returns undefined if nothing is passed', async () => {
    const serviceName = await getServiceNameFromFlags({ ...baseFlags });
    expect(serviceName).toBeUndefined();
  });

  test('defaults to package name if directory exists', async () => {
    require('../../../src/config/utils/package-json').__setPackageJson({
      name: 'bananas',
    });

    const serviceName = await getServiceNameFromFlags({
      ...baseFlags,
      cwd: process.cwd(),
    });
    expect(readPackageJsonContent).toHaveBeenCalled();
    expect(serviceName).toEqual('bananas');
  });

  test('ignores package name if undefined', async () => {
    require('../../../src/config/utils/package-json').__setPackageJson({
      name: undefined,
    });

    const serviceName = await getServiceNameFromFlags({
      ...baseFlags,
      cwd: process.cwd(),
    });
    expect(readPackageJsonContent).toHaveBeenCalled();
    expect(serviceName).toBeUndefined();
  });

  test('ignores package name if serviceName is passed', async () => {
    require('../../../src/config/utils/package-json').__setPackageJson({
      name: 'bananas',
    });

    const serviceName = await getServiceNameFromFlags({
      ...baseFlags,
      serviceName: 'twilio',
      cwd: process.cwd(),
    });
    expect(readPackageJsonContent).not.toHaveBeenCalled();
    expect(serviceName).toEqual('twilio');
  });

  test('prefers serviceName over projectName', async () => {
    require('../../../src/config/utils/package-json').__setPackageJson({
      name: 'bananas',
    });

    const serviceName = await getServiceNameFromFlags({
      ...baseFlags,
      serviceName: 'twilio',
      projectName: 'owls',
      cwd: process.cwd(),
    });
    expect(readPackageJsonContent).not.toHaveBeenCalled();
    expect(deprecateProjectName).toHaveBeenCalled();
    expect(serviceName).toEqual('twilio');
  });
});
