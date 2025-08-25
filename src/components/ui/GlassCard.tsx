// src/components/ui/GlassCard.tsx
import React from 'react';
import { YStack, styled } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  intensity?: 'light' | 'medium' | 'strong';
  animated?: boolean;
  onPress?: () => void;
  style?: any;
}

// Gradientes para diferentes variantes
const GLASS_VARIANTS = {
  default: {
    colors: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.05)'],
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.1)'
  },
  primary: {
    colors: ['rgba(59, 130, 246, 0.25)', 'rgba(59, 130, 246, 0.05)'],
    borderColor: 'rgba(59, 130, 246, 0.3)',
    shadowColor: 'rgba(59, 130, 246, 0.2)'
  },
  success: {
    colors: ['rgba(34, 197, 94, 0.25)', 'rgba(34, 197, 94, 0.05)'],
    borderColor: 'rgba(34, 197, 94, 0.3)',
    shadowColor: 'rgba(34, 197, 94, 0.2)'
  },
  warning: {
    colors: ['rgba(245, 158, 11, 0.25)', 'rgba(245, 158, 11, 0.05)'],
    borderColor: 'rgba(245, 158, 11, 0.3)',
    shadowColor: 'rgba(245, 158, 11, 0.2)'
  },
  danger: {
    colors: ['rgba(239, 68, 68, 0.25)', 'rgba(239, 68, 68, 0.05)'],
    borderColor: 'rgba(239, 68, 68, 0.3)',
    shadowColor: 'rgba(239, 68, 68, 0.2)'
  }
};

const INTENSITY_MULTIPLIERS = {
  light: 0.5,
  medium: 1,
  strong: 1.5
};

const StyledGlassContainer = styled(YStack, {
  borderRadius: '$4',
  borderWidth: 1,
  overflow: 'hidden',
  backdropFilter: 'blur(20px)',

  variants: {
    animated: {
      true: {
        pressStyle: {
          scale: 0.98,
          y: 2,
        },
        hoverStyle: {
          scale: 1.02,
          y: -2,
        },
        animation: 'quick',
      },
    }
  } as const
});

export default function GlassCard({
  children,
  variant = 'default',
  intensity = 'medium',
  animated = false,
  onPress,
  style,
  ...props
}: GlassCardProps) {
  const variantColors = GLASS_VARIANTS[variant];
  const intensityMultiplier = INTENSITY_MULTIPLIERS[intensity];

  // Ajustar opacidad según intensidad
  const adjustedColors = variantColors.colors.map(color => {
    const [r, g, b, a] = color.match(/[\d.]+/g)?.map(Number) || [0, 0, 0, 0];
    const newAlpha = Math.min(a * intensityMultiplier, 0.4);
    return `rgba(${r}, ${g}, ${b}, ${newAlpha})`;
  });

  return (
    <StyledGlassContainer
      {...props}
      animated={animated}
      onPress={onPress}
      borderColor={variantColors.borderColor}
      shadowColor={variantColors.shadowColor}
      shadowOffset={{ width: 0, height: 8 }}
      shadowOpacity={0.3}
      shadowRadius={16}
      elevation={8}
      style={style}
    >
      <LinearGradient
        colors={adjustedColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Efecto de brillo sutil */}
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="50%"
        background="linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)"
        pointerEvents="none"
      />

      {/* Contenido */}
      <YStack position="relative" zIndex={1}>
        {children}
      </YStack>
    </StyledGlassContainer>
  );
}

// Componentes especializados para casos comunes
export function GlassStatsCard({ children, ...props }: Omit<GlassCardProps, 'variant'>) {
  return (
    <GlassCard variant="primary" intensity="medium" animated {...props}>
      {children}
    </GlassCard>
  );
}

export function GlassSuccessCard({ children, ...props }: Omit<GlassCardProps, 'variant'>) {
  return (
    <GlassCard variant="success" intensity="medium" animated {...props}>
      {children}
    </GlassCard>
  );
}

export function GlassWarningCard({ children, ...props }: Omit<GlassCardProps, 'variant'>) {
  return (
    <GlassCard variant="warning" intensity="medium" animated {...props}>
      {children}
    </GlassCard>
  );
}