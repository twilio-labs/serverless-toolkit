test('base should not be importable', () => {
  expect(() => {
    require('..');
  }).toThrow();
});
