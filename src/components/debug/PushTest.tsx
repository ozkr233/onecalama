import React, { useMemo } from 'react'
import { Button, Card, Text, YStack, XStack } from 'tamagui'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import { scheduleLocalNotification } from '../../services/notifications'

export default function PushTest() {
  const { expoPushToken, ensureRegistered } = usePushNotifications()
  const shortToken = useMemo(() => expoPushToken ? `${expoPushToken.slice(0, 17)}…` : '—', [expoPushToken])

  return (
    <Card p="$4" mt="$4" bg="white">
      <YStack gap="$3">
        <Text fontWeight="700">Prueba de notificaciones</Text>
        <XStack ai="center" jc="space-between">
          <Text size="$2">Token: {shortToken}</Text>
          <XStack gap="$2">
            <Button size="$2" onPress={() => ensureRegistered()}>Obtener token</Button>
          </XStack>
        </XStack>
        <Button size="$3" onPress={() => scheduleLocalNotification({ title: 'OneCalama', body: 'Notificación de prueba local' })}>
          Enviar notificación local
        </Button>
      </YStack>
    </Card>
  )
}
