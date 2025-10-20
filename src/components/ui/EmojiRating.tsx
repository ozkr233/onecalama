// src/components/ui/EmojiRating.tsx
import React from 'react'
import { Pressable } from 'react-native'
import { XStack, Text } from 'tamagui'

type RatingValue = 1 | 2 | 3 | 4 | 5

export type EmojiRatingProps = {
  value?: number | null
  onChange?: (value: RatingValue) => void
  disabled?: boolean
  size?: number
  showLabel?: boolean
}

const EMOJIS: { value: RatingValue; emoji: string; label: string }[] = [
  { value: 1, emoji: '😠', label: 'Muy mala' },
  { value: 2, emoji: '😕', label: 'Mala' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '🙂', label: 'Buena' },
  { value: 5, emoji: '😄', label: 'Excelente' },
]

export function EmojiRating({ value, onChange, disabled, size = 24, showLabel = true }: EmojiRatingProps) {
  return (
    <XStack alignItems="center" space="$2">
      <XStack space="$1" alignItems="center">
        {EMOJIS.map(({ value: v, emoji }) => {
          const selected = typeof value === 'number' && value >= v
          return (
            <Pressable key={v} onPress={() => !disabled && onChange?.(v)} disabled={disabled}>
              <Text fontSize={size} opacity={disabled ? 0.6 : selected ? 1 : 0.4}>
                {emoji}
              </Text>
            </Pressable>
          )
        })}
      </XStack>
      {showLabel && typeof value === 'number' && (
        <Text fontSize="$2" color="$color11">({value}/5)</Text>
      )}
    </XStack>
  )
}

export default EmojiRating

