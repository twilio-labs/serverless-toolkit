import { CliInfo } from '../../../src/commands/types';
import '../../../src/config/utils/mergeFlagsAndConfig';
import { mergeFlagsAndConfig } from '../../../src/config/utils/mergeFlagsAndConfig';

const baseFlags = {
  config: '.twilioserverlessrc',
  cwd: process.cwd(),
  list: true,
};

const exampleCliInfo: CliInfo = {
  argsDefaults: {
    name: 'dominik',
  },
  options: {
    template: {
      type: 'string',
      description: 'Name of template to be used',
    },
    list: {
      type: 'boolean',
      alias: 'l',
      describe: 'List content',
      default: true,
    },
  },
};

describe('mergeFlagsAndConfig', () => {
  test('should return flags if no config is passed', () => {
    const merged = mergeFlagsAndConfig<any>({}, baseFlags, exampleCliInfo);
    expect(merged).toEqual(baseFlags);
  });

  test('should return options if passed and no flags', () => {
    const merged = mergeFlagsAndConfig<any>(
      {
        template: 'hello',
      },
      baseFlags,
      exampleCliInfo
    );
    expect(merged).toEqual({
      ...baseFlags,
      template: 'hello',
    });
  });

  test('flags should override config', () => {
    const merged = mergeFlagsAndConfig<any>(
      {
        template: 'hello',
        list: false,
      },
      { ...baseFlags, template: 'bye' },
      exampleCliInfo
    );
    expect(merged).toEqual({
      template: 'bye',
      list: false,
      config: '.twilioserverlessrc',
      cwd: process.cwd(),
    });
  });

  test('should override flags if flag is default value', () => {
    const merged = mergeFlagsAndConfig<any>(
      {
        template: 'hello',
        list: false,
      },
      baseFlags,
      exampleCliInfo
    );
    expect(merged).toEqual({
      template: 'hello',
      list: false,
      config: '.twilioserverlessrc',
      cwd: process.cwd(),
    });
  });

  test('the cwd flag should be overriden by config if default is set', () => {
    const merged = mergeFlagsAndConfig<any>(
      {
        template: 'hello',
        list: false,
        cwd: '/some/path',
      },
      baseFlags,
      exampleCliInfo
    );
    expect(merged).toEqual({
      template: 'hello',
      list: false,
      config: '.twilioserverlessrc',
      cwd: '/some/path',
    });
  });
});
