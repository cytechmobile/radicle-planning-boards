import maninak from '@maninak/eslint-config'

export default maninak(
  {
    ignores: ['*.md'],
    typescript: {
      tsconfigPath: 'tsconfig.json',
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'max-len': ['error', 120],
    },
  },
)
