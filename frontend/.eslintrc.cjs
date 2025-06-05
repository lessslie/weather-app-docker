module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', '*.ts', '*.tsx', 'tailwind.config.ts', 'postcss.config.js'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'no-unused-vars': 'warn'
  },
  overrides: [
    // Configuración para archivos JavaScript
    {
      files: ['*.js', '*.jsx'],
      rules: {
        'no-unused-vars': 'warn'
      }
    }
  ]
}
