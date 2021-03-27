module.exports = {
  root: true,
  env: {
    browser: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
  ],
  plugins: [
  ],
  // add your custom rules here
  rules: {
    'comma-dangle': ['warn', 'always-multiline'],
    'arrow-parens': ['error', 'as-needed'],
    curly: ['error', 'multi-line'],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
}
