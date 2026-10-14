import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import prettier from 'eslint-config-prettier';

const LIMITE_LINEAS = { skipBlankLines: true, skipComments: true };

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,js}'],
    plugins: { sonarjs },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Solo named exports (ver CLAUDE.md).',
        },
        {
          selector: 'TSEnumDeclaration',
          message: 'Usar uniones de strings en vez de enum.',
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'document',
          property: 'createElement',
          message: 'Usar crearElemento() de shared/utils.',
        },
        {
          object: 'document',
          property: 'querySelector',
          message: 'Usar obtenerElemento() de shared/utils.',
        },
      ],
      'max-lines-per-function': ['error', { max: 30, ...LIMITE_LINEAS }],
      'max-lines': ['error', { max: 150, ...LIMITE_LINEAS }],
      'max-params': ['error', 3],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': 'error',
      eqeqeq: 'error',
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-duplicate-string': 'error',
    },
  },
  {
    // Los helpers de DOM son el unico lugar autorizado a usar la API nativa
    files: ['src/shared/utils/dom.ts'],
    rules: { 'no-restricted-properties': 'off' },
  },
  {
    // Vite y ESLint exigen export default en sus archivos de configuracion
    files: ['*.config.{js,ts}'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    // describe() agrupa muchos casos y los textos de test se repiten a proposito
    files: ['**/*.test.ts'],
    rules: {
      'max-lines-per-function': 'off',
      'sonarjs/no-duplicate-string': 'off',
    },
  },
  prettier,
);
