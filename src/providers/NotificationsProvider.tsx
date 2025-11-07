import React, { PropsWithChildren, useEffect } from 'react'
import { setForegroundNotificationBehavior } from '../services/notifications'
import { usePushNotifications } from '../hooks/usePushNotifications'

type Props = PropsWithChildren<{
  autoRegister?: boolean
}>

export function NotificationsProvider({ children, autoRegister = false }: Props) {
  const { ensureRegistered } = usePushNotifications()

  useEffect(() => {
    setForegroundNotificationBehavior()
  }, [])

  useEffect(() => {
    if (autoRegister) {
      ensureRegistered().catch(() => {})
    }
  }, [autoRegister])

  return <>{children}</>
}

