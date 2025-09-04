module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        "nativewind/babel",
      ],
      plugins: [
        // ... autres plugins
        'react-native-reanimated/plugin', // Doit être le dernier plugin dans la liste
      ],
    };
  };


  module.exports = function(api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        ['module:react-native-dotenv', {
          moduleName: '@env',
          path: '.env',
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true
        }]
      ]
    };
  };
  