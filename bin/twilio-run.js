#!/usr/bin/env node

require('../src/cli')
  .run(process.argv)
  .catch(err => console.error(err));
