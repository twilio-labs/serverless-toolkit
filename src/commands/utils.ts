import util from 'util';

export const deprecateProjectName = util.deprecate(() => {},
'--project-name is deprecated. Please use --service-name instead. If both have been passed --service-name will be preferred.');
