// src/components/TamaguiProvider.tsx
import React from 'react'
import { TamaguiProvider as TamaguiProviderOriginal } from 'tamagui'
import config from '../tamagui.config'

export function TamaguiProvider({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProviderOriginal config={config} defaultTheme="calama">
      {children}
    </TamaguiProviderOriginal>
  )
}