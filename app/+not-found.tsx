import React from 'react'
import { SafeAreaView } from 'react-native'
import { Button, H3, Paragraph, YStack } from 'tamagui'
import { router } from 'expo-router'

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <YStack f={1} ai="center" jc="center" gap="$4" p="$4">
        <H3>Página no encontrada</H3>
        <Paragraph ta="center">
          La ruta que intentas abrir no existe.
        </Paragraph>
        <Button onPress={() => router.replace('/(tabs)')}>Volver al inicio</Button>
      </YStack>
    </SafeAreaView>
  )
}

