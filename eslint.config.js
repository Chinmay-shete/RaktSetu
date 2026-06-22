import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'RacktSetu/**']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // React 17+ new JSX transform: 'React' does not need to be in scope
      // Suppress the false-positive for unused React import
      'no-unused-vars': ['warn', {
        varsIgnorePattern: '^React$',   // allow "import React" pattern
        argsIgnorePattern: '^_',        // allow _err, _event, etc. in catch/callbacks
        caughtErrorsIgnorePattern: '^_' // allow catch(_err)
      }],
      // Context files export both Provider components AND custom hooks.
      // This is a standard React pattern — downgrade to warning, not error.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
])

