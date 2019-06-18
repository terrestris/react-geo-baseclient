module.exports =
{
  'presets': [
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  'env': {
    'coverage': {
      'plugins': [
        [
          'istanbul', {
            'exclude': [
              'spec/**/*.js*'
            ]
          }
        ]
      ]
    }
  },
  'plugins': [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-modules-commonjs',
    [
      'import',
      {
        'libraryName': 'antd',
        'style': true,
        'libraryDirectory': 'es'
      },
      'import-antd'
    ],
    [
      '@babel/plugin-proposal-decorators',
      {
        'legacy': true
      }
    ],
    [
      '@babel/plugin-transform-runtime',
      {
        'regenerator': true
      }
    ]
  ]
};
