#!/usr/bin/env node

require('../dist/cli')
  .run(process.argv)
  .catch(err => console.error(err));
