// src/tamagui.config.ts - Configuración final fusionada (con fuentes Inter)
import { config } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

// ✅ NOTA: Asegúrate de cargar las fuentes en App.tsx con @expo-google-fonts/inter
// useFonts({ Inter: Inter_400Regular, InterMedium: Inter_500Medium, InterBold: Inter_700Bold })

// Colores personalizados de la municipalidad de Calama
const customTokens = {
  color: {
    // Colores principales de la municipalidad
    primary: '#E67E22', // Naranja principal
    primaryLight: '#F39C12',
    primaryDark: '#D35400',

    // Colores secundarios
    secondary: '#009688', // Verde azulado
    secondaryLight: '#26A69A',
    secondaryDark: '#00796B',

    // Colores de municipalidad
    municipal: '#1A237E', // Azul municipalidad
    municipalLight: '#3F51B5',
    municipalDark: '#0D47A1',

    // Colores de estado
    success: '#4CAF50',
    successLight: '#81C784',
    successDark: '#388E3C',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',

    // Colores neutros
    background: '#FAFAFA',
    surface: '#FFFFFF',

    // Colores de texto
    textPrimary: '#212121',
    textSecondary: '#757575',
    textDisabled: '#BDBDBD',

    // Colores de estado de denuncias
    statusReceived: '#FFF3E0', // Naranja claro
    statusInProgress: '#E3F2FD', // Azul claro
    statusResolved: '#E8F5E9', // Verde claro
    statusPending: '#FFEBEE', // Rojo claro
    statusNotResolved: '#FFCDD2', // Rojo más fuerte

    // Colores adicionales para componentes
    red2: '#fef2f2',
    red6: '#dc2626',
    red10: '#dc2626',
    gray2: '#f9fafb',
    gray6: '#d1d5db',
    gray8: '#9ca3af',
  },
}

// ✅ Override de fuentes para usar Inter (sin romper el preset v3)
const fonts = {
  ...config.fonts,

  // Fuente principal de texto
  body: {
    ...config.fonts.body,
    family: 'Inter',                 // ← coincide con la key que cargas en useFonts
    weight: {
      ...config.fonts.body?.weight,
      4: '400', // Regular
      5: '500', // Medium
      7: '700', // Bold
    },
  },

  // Encabezados también con Inter (puedes subir pesos si quieres)
  heading: {
    ...config.fonts.heading,
    family: 'Inter',
    weight: {
      ...config.fonts.heading?.weight,
      5: '500',
      6: '600',
      7: '700',
      8: '800',
    },
  },

  // Monoespaciada: deja la del preset o cámbiala si cargaste otra
  mono: {
    ...config.fonts.mono,
  },
}

const appConfig = createTamagui({
  ...config,
  tokens: {
    ...config.tokens,
    ...customTokens,
  },
  // ✅ Aplica las fuentes Inter
  fonts,
  // (opcional) fuerza font por defecto en componentes que no especifiquen
  defaultFont: 'body',

  themes: {
    ...config.themes,

    // Tema personalizado para la app
    calama: {
      background: customTokens.color.background,
      backgroundHover: customTokens.color.surface,
      backgroundPress: customTokens.color.municipal,
      backgroundFocus: customTokens.color.primaryLight,
      color: customTokens.color.textPrimary,
      colorHover: customTokens.color.textSecondary,
      colorPress: customTokens.color.surface,
      colorFocus: customTokens.color.primary,
      borderColor: customTokens.color.textDisabled,
      borderColorHover: customTokens.color.primary,
      borderColorPress: customTokens.color.primaryDark,
      borderColorFocus: customTokens.color.primary,

      // Tokens específicos que usan nuestros componentes
      primary: customTokens.color.primary,
      primaryDark: customTokens.color.primaryDark,
      secondary: customTokens.color.secondary,
      success: customTokens.color.success,
      successDark: customTokens.color.successDark,
      warning: customTokens.color.warning,
      error: customTokens.color.error,

      // Colores adicionales para validaciones y estados
      red2: customTokens.color.red2,
      red6: customTokens.color.red6,
      red10: customTokens.color.red10,
      gray2: customTokens.color.gray2,
      gray6: customTokens.color.gray6,
      gray8: customTokens.color.gray8,

      // Colores de texto específicos
      textPrimary: customTokens.color.textPrimary,
      textSecondary: customTokens.color.textSecondary,
      textDisabled: customTokens.color.textDisabled,
    },

    // Tema light que hereda de calama para compatibilidad
    light: {
      background: customTokens.color.background,
      backgroundHover: customTokens.color.surface,
      backgroundPress: customTokens.color.municipal,
      backgroundFocus: customTokens.color.primaryLight,
      color: customTokens.color.textPrimary,
      colorHover: customTokens.color.textSecondary,
      colorPress: customTokens.color.surface,
      colorFocus: customTokens.color.primary,
      borderColor: customTokens.color.textDisabled,
      borderColorHover: customTokens.color.primary,
      borderColorPress: customTokens.color.primaryDark,
      borderColorFocus: customTokens.color.primary,

      primary: customTokens.color.primary,
      primaryDark: customTokens.color.primaryDark,
      secondary: customTokens.color.secondary,
      success: customTokens.color.success,
      successDark: customTokens.color.successDark,
      warning: customTokens.color.warning,
      error: customTokens.color.error,

      red2: customTokens.color.red2,
      red6: customTokens.color.red6,
      red10: customTokens.color.red10,
      gray2: customTokens.color.gray2,
      gray6: customTokens.color.gray6,
      gray8: customTokens.color.gray8,

      textPrimary: customTokens.color.textPrimary,
      textSecondary: customTokens.color.textSecondary,
      textDisabled: customTokens.color.textDisabled,
    },
  },
})

export type AppConfig = typeof appConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default appConfig
