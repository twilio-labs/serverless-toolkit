#!/usr/bin/env node

require('../src/cli')
  .run()
  .catch(err => console.error(err));
