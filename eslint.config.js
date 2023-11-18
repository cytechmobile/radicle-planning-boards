import antfu from '@antfu/eslint-config'
import * as _pluginPrettier from 'eslint-plugin-prettier'
import * as _configPrettier from 'eslint-config-prettier'

const pluginPrettier = interopDefault(_pluginPrettier)

const prettierConflictRules = { ...interopDefault(_configPrettier).rules }
delete prettierConflictRules['vue/html-self-closing']

export default antfu(
  {
    // typescript: { tsconfigPath: 'tsconfig.json' }, TODO: uncomment and disable for non-ts files
  },
  {
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      ...prettierConflictRules,
      ...pluginPrettier.configs.recommended.rules,
      'prettier/prettier': 'warn',
    },
  },
)

function interopDefault(m) {
  return m.default || m
}
