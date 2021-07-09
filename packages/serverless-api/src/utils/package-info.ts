import fs from 'fs';
import path from 'path';
import { PackageJson } from 'type-fest';

const pkgJson: PackageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8')
);

export default pkgJson;
