import fs from 'fs';
import ow from 'ow';
import path from 'path';
import { fileExistsSync } from './fs';
import { getDebugFunction } from './logger';

const debug = getDebugFunction('twilio-run:utils:deployInfoCache');

export type DeployInfo = {
  serviceSid: string;
  latestBuild: string;
};

export type DeployInfoCache = {
  [username: string]: DeployInfo;
};

function validDeployInfoCache(data: unknown): data is DeployInfoCache {
  try {
    ow(
      data,
      ow.object.valuesOfType(
        ow.object.exactShape({
          serviceSid: ow.string.startsWith('ZS').length(34),
          latestBuild: ow.string.startsWith('ZB').length(34),
        })
      )
    );
    return true;
  } catch (err) {
    debug('Invalid deploy info file %O', err);
    return false;
  }
}

export function getDeployInfoCache(
  baseDir: string,
  deployInfoCacheFileName: string = '.twiliodeployinfo'
): DeployInfoCache {
  const fullPath = path.resolve(baseDir, deployInfoCacheFileName);
  const deployCacheInfoExists = fileExistsSync(fullPath, true);

  if (deployCacheInfoExists) {
    debug('Found deploy info cache at "%s"', fullPath);
    try {
      const rawDeployInfo = fs.readFileSync(fullPath, 'utf8');
      const deployInfoCache = JSON.parse(rawDeployInfo) as DeployInfoCache;
      debug('Parsed deploy info cache file');

      if (validDeployInfoCache(deployInfoCache)) {
        return deployInfoCache;
      }
    } catch (err) {
      debug('Failed to read deploy info cache');
    }
  }

  return {};
}

export function updateDeployInfoCache(
  baseDir: string,
  username: string,
  region: string = 'us1',
  deployInfo: DeployInfo,
  deployInfoCacheFileName: string = '.twiliodeployinfo'
): void {
  const fullPath = path.resolve(baseDir, deployInfoCacheFileName);
  debug('Read existing deploy info cache');
  const currentDeployInfoCache = getDeployInfoCache(
    baseDir,
    deployInfoCacheFileName
  );

  if (currentDeployInfoCache.hasOwnProperty(username) && region === 'us1') {
    debug('Invalid format for deploy info key. Overriding with region us1');
    debug(`${username}:${region}`);
    delete currentDeployInfoCache[username];
  }

  const newDeployInfoCache = {
    ...currentDeployInfoCache,
    [`${username}:${region}`]: deployInfo,
  };

  if (!validDeployInfoCache(newDeployInfoCache)) {
    debug('Invalid format for deploy info cache. Not writing it to disk');
    debug('%P', newDeployInfoCache);
    return;
  }

  debug('Write new deploy info cache');

  try {
    const data = JSON.stringify(newDeployInfoCache, null, '\t');
    fs.writeFileSync(fullPath, data, 'utf8');
  } catch (err) {
    debug('Failed to write deploy info cache. Carrying on without it');
  }
}
