import { Response } from 'got/dist/source';
import { EqualMatchingInjectorConfig, Mock, Times } from 'moq.ts';
import { getBuildStatus } from '../../api/builds';
import TwilioServerlessApiClient from '../../client';

describe('getBuildStatus', () => {
  test('makes a GET request to the /Status endpoint and extracts status', async () => {
    const serviceSid = `ZS123`;
    const buildSid = `ZB345`;
    const requestMethod = 'get';
    const path = `Services/${serviceSid}/Builds/${buildSid}/Status`;

    const mockClient = new Mock<TwilioServerlessApiClient>({
      injectorConfig: new EqualMatchingInjectorConfig(),
    });
    const mockResponse = new Mock<Response>();
    mockResponse
      .setup(instance => instance.body)
      .returns({
        status: 'completed',
      });
    mockClient
      .setup(instance => instance.request(requestMethod, path))
      .returns(Promise.resolve(mockResponse.object()));

    const status = await getBuildStatus(
      buildSid,
      serviceSid,
      mockClient.object()
    );

    expect(status).toEqual('completed');
    mockClient.verify(
      instance => instance.request(requestMethod, path),
      Times.Once()
    );
  });
});
