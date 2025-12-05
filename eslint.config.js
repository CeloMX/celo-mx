import js from '@eslint/js'
import next from 'eslint-config-next'

export default [
  js.configs.recommended,
  ...next,
  {
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
]
