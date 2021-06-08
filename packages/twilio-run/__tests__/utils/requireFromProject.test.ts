import { join } from 'path';
import { requireFromProject } from '../../src/utils/requireFromProject';

const PROJECT_DIR = join(__dirname, '../../../runtime-handler');

jest.mock('../../../runtime-handler/node_modules/twilio', () => {
  const x = jest.genMockFromModule('twilio');
  (x as any)['__TYPE__'] = 'PROJECT_BASED';
  return x;
});

jest.mock('twilio', () => {
  const x = jest.genMockFromModule('twilio');
  (x as any)['__TYPE__'] = 'BUILT_IN';
  return x;
});

jest.mock(
  '@twilio/invalid-dependency',
  () => {
    return {
      __TYPE__: 'BUILT_IN',
    };
  },
  { virtual: true }
);

describe('requireFromProject', () => {
  test('should return project based by default', () => {
    const mod = requireFromProject(PROJECT_DIR, 'twilio');
    expect(mod['__TYPE__']).toBe('PROJECT_BASED');
    const mod2 = require('twilio');
    expect(mod2['__TYPE__']).toBe('BUILT_IN');
  });

  test('should fail for unknown dependency', () => {
    expect(() => {
      requireFromProject(PROJECT_DIR, '@twilio/invalid-dependency');
    }).toThrowErrorMatchingSnapshot();
  });

  test('should fallback for unmatched dependency', () => {
    const mod = requireFromProject(
      PROJECT_DIR,
      '@twilio/invalid-dependency',
      true
    );
    expect(mod.__TYPE__).toBe('BUILT_IN');
  });
});
