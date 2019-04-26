const { fsHelpers } = require('@twilio-labs/serverless-api');

async function getFunctionsAndAssets(baseDir) {
  let { functions, assets } = await fsHelpers.getListOfFunctionsAndAssets(
    baseDir
  );
  functions = functions.map(fileInfo => {
    const info = fsHelpers.getPathAndAccessFromFileInfo(fileInfo, '.js');
    return {
      ...fileInfo,
      functionPath: info.path,
      access: info.access,
    };
  });
  assets = assets.map(fileInfo => {
    const info = fsHelpers.getPathAndAccessFromFileInfo(fileInfo, '.js');
    return {
      ...fileInfo,
      assetPath: info.path,
      access: info.access,
    };
  });
  return { functions, assets };
}

module.exports = { getFunctionsAndAssets };
