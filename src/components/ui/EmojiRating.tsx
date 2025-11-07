// src/components/ui/EmojiRating.tsx
import React from 'react'
import { XStack, YStack, Text, AnimatePresence } from 'tamagui'

type RatingValue = 1 | 2 | 3 | 4 | 5

export type EmojiRatingProps = {
  value?: number | null
  onChange?: (value: RatingValue) => void
  disabled?: boolean
  size?: number
  showLabel?: boolean
}

const EMOJIS: { value: RatingValue; emoji: string; label: string }[] = [
  { value: 1, emoji: '😠', label: 'Terrible' },
  { value: 2, emoji: '😕', label: 'Mala' },
  { value: 3, emoji: '😐', label: 'Regular' },
  { value: 4, emoji: '🙂', label: 'Buena' },
  { value: 5, emoji: '😄', label: 'Excelente' },
]

export function EmojiRating({ value, onChange, disabled, size = 24, showLabel = true }: EmojiRatingProps) {
  const getLabel = (val?: number | null) => {
    const found = EMOJIS.find(e => e.value === val)
    return found?.label
  }

  return (
    <XStack alignItems="center" space="$2">
      <XStack space="$2" alignItems="center">
        {EMOJIS.map(({ value: v, emoji }) => {
          const selected = typeof value === 'number' && value === v
          return (
            <YStack
              key={v}
              onPress={() => !disabled && onChange?.(v)}
              pointerEvents={disabled ? 'none' : 'auto'}
              animation="quick"
              scale={selected ? 1.15 : 1}
              hoverStyle={{ scale: selected ? 1.18 : 1.05 }}
              pressStyle={{ scale: selected ? 1.1 : 0.96 }}
              backgroundColor={selected ? '$yellow2' : 'transparent'}
              borderColor={selected ? '$yellow8' : 'transparent'}
              borderWidth={selected ? 1 : 0}
              borderRadius={9999}
              paddingHorizontal={6}
              paddingVertical={2}
            >
              <Text fontSize={size} opacity={disabled ? 0.6 : selected ? 1 : 0.5}>
                {emoji}
              </Text>
            </YStack>
          )
        })}
      </XStack>
      <AnimatePresence>
        {showLabel && typeof value === 'number' && (
          <Text
            key={`label-${value}`}
            fontSize="$2"
            color="$color11"
            animation="medium"
            enterStyle={{ opacity: 0, x: 6 }}
            exitStyle={{ opacity: 0, x: -6 }}
          >
            {getLabel(value)}
          </Text>
        )}
      </AnimatePresence>
    </XStack>
  )
}

export default EmojiRating
