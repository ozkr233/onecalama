import { useEffect, useRef, useState } from 'react'
import * as Notifications from 'expo-notifications'
import { router } from 'expo-router'
import { isNotificationsEnabled, registerForPushNotificationsAsync, sendRegistrationToServer, getStoredPushToken, setNotificationsEnabled } from '../services/notifications'

export type RespuestaNotificationData = {
  type?: 'respuesta' | string
  publicacionId?: string | number
  respuestaId?: string | number
}

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const [enabled, setEnabled] = useState<boolean>(false)
  const notificationListener = useRef<Notifications.Subscription | null>(null)
  const responseListener = useRef<Notifications.Subscription | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const storedEnabled = await isNotificationsEnabled()
      setEnabled(storedEnabled)
      const storedToken = await getStoredPushToken()
      if (mounted) setExpoPushToken(storedToken)
    })()

    // Foreground notifications listener
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {})

    // Tap/open listener
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = (response?.notification?.request?.content?.data || {}) as RespuestaNotificationData
      if (data?.type === 'respuesta' && data.publicacionId) {
        try {
          router.push(`/denuncia/${data.publicacionId}` as any)
        } catch {
          // ignore
        }
      }
    })

    return () => {
      mounted = false
      notificationListener.current?.remove?.()
      responseListener.current?.remove?.()
    }
  }, [])

  const ensureRegistered = async () => {
    const token = await registerForPushNotificationsAsync()
    if (token) {
      setExpoPushToken(token)
      await sendRegistrationToServer(token)
      await setNotificationsEnabled(true)
      setEnabled(true)
    }
    return token
  }

  const disable = async () => {
    // server side deactivation is handled in service to be idempotent
    await setNotificationsEnabled(false)
    setEnabled(false)
  }

  return {
    expoPushToken,
    enabled,
    ensureRegistered,
    disable,
  }
}
