module.exports = {
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: [
      [
        'import',
        {
          libraryName: 'react-icons',
          libraryDirectory: 'lib',
          camel2DashComponentName: false,
        },
        'react-icons',
      ],
    ],
  };