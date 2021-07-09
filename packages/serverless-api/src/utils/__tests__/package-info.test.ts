import pkgJson from '../package-info';

test('imports package.json information', () => {
  const pkgJsonSource = require('../../../package.json');
  expect(pkgJson).toEqual(pkgJsonSource);
});
