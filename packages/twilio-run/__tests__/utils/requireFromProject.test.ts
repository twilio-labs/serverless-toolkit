import { join } from 'path';
import { requireFromProject } from '../../src/utils/requireFromProject';

const PROJECT_DIR = join(__dirname, '../../../runtime-handler');

// jest.mock('../../../runtime-handler/node_modules/@twilio/test-dep', () => {
//   const x = jest.genMockFromModule('@twilio/test-dep');
//   (x as any)['__TYPE__'] = 'PROJECT_BASED';
//   return x;
// });

jest.mock('@twilio/test-dep', () => {
  const x = jest.genMockFromModule('@twilio/test-dep');
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
  // NPM hoists the package under root node_modules making this test not possible currently
  // test('should return project based by default', () => {
  //   const mod = requireFromProject(PROJECT_DIR, '@twilio/test-dep');
  //   expect(mod['__TYPE__']).toBe('PROJECT_BASED');
  //   const mod2 = require('@twilio/test-dep');
  //   expect(mod2['__TYPE__']).toBe('BUILT_IN');
  // });

  test('should fail for unknown dependency', () => {
    expect(() => {
      requireFromProject(PROJECT_DIR, '@twilio/invalid-dependency');
    }).toThrowError(
      /^Cannot resolve module '@twilio\/invalid-dependency' from paths/
    );
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
