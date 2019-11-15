function assertContainsLettersNumbersHyphens(name) {
  const nameRegex = /^[A-Za-z0-9-]+$/;
  return Boolean(name.match(nameRegex));
}

function assertDoesntStartWithHyphen(name) {
  return !name.startsWith('-');
}

function assertDoesntEndWithHyphen(name) {
  return !name.endsWith('-');
}

function assertNotLongerThan(name, chars = 32) {
  return name.length <= chars;
}

function validateProjectName(name) {
  let valid = true;
  const errors = [];
  if (!assertNotLongerThan(name, 32)) {
    valid = false;
    errors.push('must be shorter than 32 characters');
  }
  if (!assertContainsLettersNumbersHyphens(name)) {
    valid = false;
    errors.push('must only include letters, numbers and hyphens');
  }
  if (!assertDoesntStartWithHyphen(name)) {
    valid = false;
    errors.push('must not start with a hyphen');
  }
  if (!assertDoesntEndWithHyphen(name)) {
    valid = false;
    errors.push('must not end with a hyphen');
  }
  return {
    valid,
    errors,
  };
}

module.exports = validateProjectName;
