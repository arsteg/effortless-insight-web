import coreWebVitals from 'eslint-config-next/core-web-vitals'

const config = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'coverage/**',
      'next-env.d.ts',
      'public/**',
    ],
  },
  ...coreWebVitals,
]

export default config
