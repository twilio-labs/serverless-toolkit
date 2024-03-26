jest.mock('window-size', () => ({
  get: jest
    .fn()
    .mockReturnValueOnce({
      width: 40,
      height: 100,
    })
    .mockReturnValueOnce()
    .mockReturnValueOnce({ height: 250 })
    .mockReturnValueOnce({ width: 50 })
    .mockReturnValueOnce({
      width: 80,
      height: 300,
    }),
}));

const getWindowSize = require('../src/create-twilio-function/window-size');

describe('getWindowSize', () => {
  it('gets a valid windowSize', () => {
    const windowSize = getWindowSize();
    expect(windowSize).toEqual({
      width: 40,
      height: 100,
    });
  });
  it('cannot get a null windowSize', () => {
    const windowSize = getWindowSize();
    expect(windowSize).toEqual({
      width: 80,
      height: 300,
    });
  });
  it('gets a windowSize without a width', () => {
    const windowSize = getWindowSize();
    expect(windowSize).toEqual({
      width: 80,
      height: 250,
    });
  });
  it('gets a windowSize without a height', () => {
    const windowSize = getWindowSize();
    expect(windowSize).toEqual({
      width: 50,
      height: 300,
    });
  });
  it('gets a windowSize without a width nor a height', () => {
    const windowSize = getWindowSize();
    expect(windowSize).toEqual({
      width: 80,
      height: 300,
    });
  });
});
