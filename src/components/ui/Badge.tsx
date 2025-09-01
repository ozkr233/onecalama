// src/components/ui/Badge.tsx
import React from 'react';
import { Text, styled } from 'tamagui';

interface BadgeProps {
  children: React.ReactNode;
  bg?: string;
  color?: string;
  fontSize?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const BadgeContainer = styled(Text, {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: '$2',
  paddingVertical: '$1',
  borderRadius: '$2',
  fontSize: '$2',
  fontWeight: '600',
  textAlign: 'center',
  
  variants: {
    variant: {
      default: {
        backgroundColor: '$gray8',
        color: 'white',
      },
      success: {
        backgroundColor: '$green8',
        color: 'white',
      },
      error: {
        backgroundColor: '$red8',
        color: 'white',
      },
      warning: {
        backgroundColor: '$orange8',
        color: 'white',
      },
      info: {
        backgroundColor: '$blue8',
        color: 'white',
      },
    },
    size: {
      sm: {
        fontSize: '$1',
        paddingHorizontal: '$1.5',
        paddingVertical: '$0.5',
      },
      md: {
        fontSize: '$2',
        paddingHorizontal: '$2',
        paddingVertical: '$1',
      },
      lg: {
        fontSize: '$3',
        paddingHorizontal: '$3',
        paddingVertical: '$1.5',
      },
    },
  },

  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  bg, 
  color, 
  fontSize, 
  variant = 'default',
  size = 'md',
  ...props 
}) => {
  return (
    <BadgeContainer
      variant={variant}
      size={size}
      backgroundColor={bg}
      color={color}
      fontSize={fontSize}
      {...props}
    >
      {children}
    </BadgeContainer>
  );
};