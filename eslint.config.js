import antfu from '@antfu/eslint-config'
import * as pluginPrettier from 'eslint-plugin-prettier'
import * as configPrettier from 'eslint-config-prettier'

const prettier = interopDefault(pluginPrettier)

const prettierRulesFixingConflictsWithEslint = { ...interopDefault(configPrettier).rules }
delete prettierRulesFixingConflictsWithEslint['vue/html-self-closing']

/** @type {import("prettier").Config} */
const prettierConfig = {
  printWidth: 95,
  useTabs: false,
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  quoteProps: 'consistent',
  arrowParens: 'always',
  htmlWhitespaceSensitivity: 'ignore',
}

export default antfu(
  {
    // typescript: { tsconfigPath: 'tsconfig.json' }, TODO: uncomment and disable for non-ts files
  },
  {
    plugins: { prettier },
    rules: {
      ...prettierRulesFixingConflictsWithEslint,
      ...prettier.configs.recommended.rules,
      'prettier/prettier': ['warn', prettierConfig],
    },
  },
)

function interopDefault(m) {
  return m.default || m
}
