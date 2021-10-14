export function writeOutput(...args: any[]) {
  console.log(...args);
}

export function writeJSONOutput(obj: any) {
  writeOutput(JSON.stringify(obj, null, '\t'));
}
