// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configuración específica para Tamagui
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-svg': '@expo/react-native-svg',
  
  // Alias para resolver rutas src/
  '@': path.resolve(__dirname, 'src'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@services': path.resolve(__dirname, 'src/services'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
  '@types': path.resolve(__dirname, 'src/types'),
  '@utils': path.resolve(__dirname, 'src/utils'),
  '@constants': path.resolve(__dirname, 'src/constants'),
  '@assets': path.resolve(__dirname, 'assets'),  // ← AGREGADO
  '@data': path.resolve(__dirname, 'src/data'),  // ← AGREGADO
};

// Plataformas soportadas
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// === CONFIGURACIONES MODERNAS ADICIONALES ===

// Optimizaciones de resolución
config.resolver.extensions = [
  '.web.js',
  '.js',
  '.web.ts',
  '.ts',
  '.web.tsx',
  '.tsx',
  '.json',
];

// Configuración de transformer (para mejor performance)
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    // Optimizaciones para producción
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Configuración de serializer para web
config.serializer = {
  ...config.serializer,
  customSerializer: undefined,
};

module.exports = config;