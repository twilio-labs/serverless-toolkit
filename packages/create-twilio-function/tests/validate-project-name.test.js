const validateProjectName = require('../src/create-twilio-function/validate-project-name');

describe('validateProjectName', () => {
  it('should allow names shorter than 33 characters', () => {
    const { valid } = validateProjectName('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    expect(valid).toBe(true);
  });

  it('should disallow names longer than 32 characters', () => {
    const { valid, errors } = validateProjectName('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    expect(valid).toBe(false);
    expect(errors[0]).toEqual('must be shorter than 32 characters');
  });

  it('should allow names with letters, numbers and hyphens', () => {
    const { valid } = validateProjectName('Project-1');
    expect(valid).toBe(true);
  });

  it('should disallow names with special characters or underscores', () => {
    const names = ['project!', 'project@', '#hello', '__hey'];
    names.forEach((name) => {
      const { valid, errors } = validateProjectName(name);
      expect(valid).toBe(false);
      expect(errors[0]).toEqual('must only include letters, numbers and hyphens');
    });
  });

  it('should disallow names beginning with a hyphen', () => {
    const { valid, errors } = validateProjectName('-otherwisecool');
    expect(valid).toBe(false);
    expect(errors[0]).toBe('must not start with a hyphen');
  });

  it('should disallow names ending with a hyphen', () => {
    const { valid, errors } = validateProjectName('otherwisecool-');
    expect(valid).toBe(false);
    expect(errors[0]).toBe('must not end with a hyphen');
  });

  it('should return multiple messages if there are multiple errors', () => {
    const { valid, errors } = validateProjectName('-not#Cool-');
    expect(valid).toBe(false);
    expect(errors.length).toBe(3);
  });
});
