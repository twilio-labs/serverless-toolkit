import path from 'path';
import { Mock } from 'moq.ts';

import { TwilioServerlessApiClient } from '../..';
import { AssetResource, ClientConfig } from '../../types';
import { uploadAsset } from '../../api/assets';

const mockServiceId = '';
const mockConfig = new Mock<ClientConfig>();
const mockClient = new Mock<TwilioServerlessApiClient>();

describe('uploadAsset', () => {
  test('displays file name on upload error', async () => {
    const testFileName = '.gitkeep';
    const testFilePath = path.join(__dirname, '.gitkeep');

    const testAsset = new Mock<AssetResource>()
      .setup((instance) => instance.name)
      .returns(testFileName)

      .setup((instance) => instance.path)
      .returns(testFilePath)

      .setup((instance) => instance.content)
      .returns('');

    await expect(
      uploadAsset(
        testAsset.object(),
        mockServiceId,
        mockClient.object(),
        mockConfig.object()
      )
    ).rejects.toThrow(`Failed to upload Asset ${testFileName}`);
  });
});
