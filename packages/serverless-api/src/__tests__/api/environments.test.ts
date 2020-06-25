import { createEnvironmentFromSuffix } from '../../api/environments';
import { Mock, EqualMatchingInjectorConfig, Times } from 'moq.ts';
import { TwilioServerlessApiClient } from '../..';
import { Response } from 'got/dist/source';

describe('createEnvironmentFromSuffix', () => {
  test('makes a POST request to the environments API with the domainSuffix', async () => {
    const domainSuffix = 'test';
    const serviceSid = 'ZS123';
    const requestMethod = 'post';
    const path = `Services/${serviceSid}/Environments`;
    const requestData = {
      form: {
        UniqueName: 'test-environment',
        FriendlyName: 'test-environment Environment (Created by CLI)',
        DomainSuffix: domainSuffix,
      },
    };
    const mockClient = new Mock<TwilioServerlessApiClient>({
      injectorConfig: new EqualMatchingInjectorConfig(),
    });
    const mockResponse = new Mock<Response>();
    mockResponse.setup((instance) => instance.body).returns({});
    mockClient
      .setup((instance) => instance.request(requestMethod, path, requestData))
      .returns(Promise.resolve(mockResponse.object()));

    await createEnvironmentFromSuffix(
      domainSuffix,
      serviceSid,
      mockClient.object()
    );

    mockClient.verify(
      (instance) => instance.request(requestMethod, path, requestData),
      Times.Once()
    );
  });

  test('makes a POST request to the environments API without the domainSuffix', async () => {
    const domainSuffix = '';
    const serviceSid = 'ZS123';
    const requestMethod = 'post';
    const path = `Services/${serviceSid}/Environments`;
    const requestData = {
      form: {
        UniqueName: 'production',
        FriendlyName: 'production Environment (Created by CLI)',
      },
    };
    const mockClient = new Mock<TwilioServerlessApiClient>({
      injectorConfig: new EqualMatchingInjectorConfig(),
    });
    const mockResponse = new Mock<Response>();
    mockResponse.setup((instance) => instance.body).returns({});
    mockClient
      .setup((instance) => instance.request(requestMethod, path, requestData))
      .returns(Promise.resolve(mockResponse.object()));

    await createEnvironmentFromSuffix(
      domainSuffix,
      serviceSid,
      mockClient.object()
    );

    mockClient.verify(
      (instance) => instance.request(requestMethod, path, requestData),
      Times.Once()
    );
  });
});
