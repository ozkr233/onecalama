import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiService } from './api'
import { ENDPOINTS } from '../constants/api'

export type PushTokenRegistration = {
  token: string
  device_id?: string
  platform: 'ios' | 'android' | 'web' | 'unknown'
}

const STORAGE_KEYS = {
  expoToken: 'expoPushToken',
  notificationsEnabled: 'notificationsEnabled',
}

export async function getStoredPushToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.expoToken)
  } catch {
    return null
  }
}

export async function isNotificationsEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.notificationsEnabled)
  return value === 'true'
}

export async function setNotificationsEnabled(enabled: boolean) {
  await AsyncStorage.setItem(STORAGE_KEYS.notificationsEnabled, String(enabled))
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('[Notifications] Not a physical device; skipping push token')
    return null
  }

  // Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'General',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF7F2A',
      sound: undefined,
    })
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }
  if (finalStatus !== 'granted') {
    console.warn('[Notifications] Permission not granted')
    await setNotificationsEnabled(false)
    return null
  }

  try {
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined as any
    )
    const token = tokenResponse.data
    await AsyncStorage.setItem(STORAGE_KEYS.expoToken, token)
    await setNotificationsEnabled(true)
    return token
  } catch (e) {
    console.warn('[Notifications] Failed to get Expo push token', e)
    return null
  }
}

export async function sendRegistrationToServer(token: string) {
  try {
    const payload: PushTokenRegistration = {
      token,
      device_id: Device.osBuildId ?? undefined,
      platform: Platform.OS as any,
    }
    // Backend will secure and store token per user session
    await apiService.post(ENDPOINTS.NOTIFICACIONES.REGISTRAR, payload, true)
  } catch (e) {
    // Backend may not be ready; swallow error but keep token stored
    console.warn('[Notifications] Could not register token in backend (will retry later)', e)
  }
}

export async function disableNotificationsOnServer() {
  try {
    await apiService.post(ENDPOINTS.NOTIFICACIONES.DESACTIVAR, {}, true)
  } catch (e) {
    console.warn('[Notifications] Could not disable notifications on backend', e)
  } finally {
    await AsyncStorage.removeItem(STORAGE_KEYS.expoToken)
    await setNotificationsEnabled(false)
  }
}

export async function scheduleLocalNotification(opts: {
  title: string
  body: string
  data?: Record<string, any>
}) {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: opts.title,
      body: opts.body,
      data: opts.data,
    },
    trigger: null,
  })
}

export function setForegroundNotificationBehavior() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  })
}

