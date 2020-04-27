import gotModule from 'got';

// Got has retry logic that we don't want to use in tests
export const got =
  process.env.NODE_ENV === 'test'
    ? gotModule.extend({ retry: { limit: 0 } })
    : gotModule;

export default got;
