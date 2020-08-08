let localEnv = {};
let envPath = '';

export function __setVariables(vars = {}, path = '') {
  localEnv = vars;
  envPath = path;
}

export const readLocalEnvFile = jest.fn(async () => {
  return { localEnv, envPath };
});
