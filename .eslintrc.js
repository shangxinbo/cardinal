// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    node:true
  },
  extends: 'eslint:recommended',
  // add your custom rules here
  'rules': {
    'no-implied-eval': 1,
    'no-loop-func': 1,
    'indent': ["warn", 4, { "SwitchCase": 1 }],
    'no-mixed-spaces-and-tabs': 1,
    'semi': ["error", "never"],
    'no-console':0,
    'no-unused-vars':0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
