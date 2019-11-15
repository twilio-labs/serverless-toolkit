module.exports = {
  'extends': 'twilio',
  'plugins': ['jest'],
  'env': {
    'jest/globals': true
  },
  'parserOptions': {
    'ecmaVersion': 9,
    'sourceType': 'module',
  },
  'rules': {
      'no-console': 'off'
  }
}