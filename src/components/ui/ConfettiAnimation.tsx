// src/components/ui/ConfettiAnimation.tsx
import React, { useEffect, useState } from 'react';
import { YStack, XStack, Circle, AnimatePresence } from 'tamagui';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiPiece {
  id: number;
  color: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  shape: 'circle' | 'square' | 'triangle';
}

interface ConfettiAnimationProps {
  show: boolean;
  onComplete?: () => void;
  duration?: number;
  particleCount?: number;
}

const CONFETTI_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export default function ConfettiAnimation({
  show,
  onComplete,
  duration = 3000,
  particleCount = 50
}: ConfettiAnimationProps) {
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (show) {
      generateConfetti();
      const timer = setTimeout(() => {
        setConfettiPieces([]);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  const generateConfetti = () => {
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < particleCount; i++) {
      pieces.push({
        id: i,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        x: Math.random() * SCREEN_WIDTH,
        y: -50 - Math.random() * 100,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.8,
        shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle'
      });
    }
    setConfettiPieces(pieces);
  };

  const renderConfettiPiece = (piece: ConfettiPiece) => {
    const fallDistance = SCREEN_HEIGHT + 100;
    const swayAmount = 50 + Math.random() * 100;

    return (
      <YStack
        key={piece.id}
        position="absolute"
        left={piece.x}
        top={piece.y}
        animation="bouncy"
        animateOnly={['transform']}
        x={piece.x + Math.sin(piece.id) * swayAmount}
        y={piece.y + fallDistance}
        rotate={`${piece.rotation + 720}deg`}
        scale={piece.scale}
        zIndex={1000}
      >
        {piece.shape === 'circle' && (
          <Circle
            size={8}
            backgroundColor={piece.color}
            shadowColor={piece.color}
            shadowOpacity={0.3}
            shadowRadius={4}
            elevation={3}
          />
        )}

        {piece.shape === 'square' && (
          <YStack
            width={8}
            height={8}
            backgroundColor={piece.color}
            borderRadius="$1"
            shadowColor={piece.color}
            shadowOpacity={0.3}
            shadowRadius={4}
            elevation={3}
          />
        )}

        {piece.shape === 'triangle' && (
          <YStack
            width={0}
            height={0}
            borderLeftWidth={4}
            borderRightWidth={4}
            borderBottomWidth={8}
            borderLeftColor="transparent"
            borderRightColor="transparent"
            borderBottomColor={piece.color}
            shadowColor={piece.color}
            shadowOpacity={0.3}
            shadowRadius={4}
            elevation={3}
          />
        )}
      </YStack>
    );
  };

  if (!show && confettiPieces.length === 0) return null;

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      pointerEvents="none"
      zIndex={999}
    >
      <AnimatePresence>
        {confettiPieces.map(renderConfettiPiece)}
      </AnimatePresence>
    </YStack>
  );
}