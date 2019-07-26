let pkgJson = {};

export function __setPackageJson(newPkg: {}) {
  pkgJson = newPkg;
}

export const readPackageJsonContent = jest.fn(async () => {
  return pkgJson;
});
