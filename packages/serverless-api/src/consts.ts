export enum DeployStatus {
  CREATING_SERVICE = 'creating-service',
  CONFIGURING_ENVIRONMENT = 'configuring-environment',
  READING_FILESYSTEM = 'reading-filesystem',
  CREATING_FUNCTIONS = 'creating-functions',
  UPLOADING_FUNCTIONS = 'uploading-functions',
  CREATING_ASSETS = 'creating-assets',
  UPLOADING_ASSETS = 'uploading-assets',
  BUILDING = 'building',
  SETTING_VARIABLES = 'setting-variables',
  TIMED_OUT = 'timed-out',
  ACTIVATING_DEPLOYMENT = 'activating-deployment',
  DONE = 'done',
}
