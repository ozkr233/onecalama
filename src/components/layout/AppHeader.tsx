// src/components/layout/AppHeader.tsx - ACTUALIZADO CON AUTENTICACIÓN
import React from 'react';
import { Text, YStack, XStack, Image, Button } from 'tamagui';
import { StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { UserDisplay, UserAvatar } from '../ui/UserDisplay';

interface AppHeaderProps {
  screenTitle: string;
  screenSubtitle?: string;
  screenIcon?: keyof typeof Ionicons.glyphMap;
  showNotifications?: boolean;
  notificationCount?: number;
  showAppInfo?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showLogout?: boolean; // Nueva prop para mostrar botón de logout
}

export default function AppHeader({
  screenTitle,
  screenSubtitle,
  screenIcon,
  showNotifications = true,
  notificationCount = 0,
  showAppInfo = false,
  showBackButton = false,
  onBackPress,
  showLogout = true // Por defecto mostrar logout en headers principales
}: AppHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: logout
        },
      ]
    );
  };

  return (
    <>
      <StatusBar backgroundColor="#E67E22" barStyle="light-content" />

      {/* Header unificado */}
      <YStack
        bg="$primary"
        px="$4"
        py="$3"
        pb="$2"
        pt="$6"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <XStack jc="space-between" ai="center">
          {/* Lado izquierdo */}
          <XStack ai="center" gap="$3" f={1}>
            {/* Botón de regreso (si está habilitado) */}
            {showBackButton && (
              <Button
                size="$3"
                circular
                bg="rgba(255,255,255,0.1)"
                onPress={handleBackPress}
                pressStyle={{
                  bg: "rgba(255,255,255,0.2)",
                  scale: 0.95
                }}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <Ionicons name="arrow-back" size={20} color="white" />
              </Button>
            )}

            {/* Información de la app (solo en pantalla principal) */}
            {showAppInfo ? (
              <XStack ai="center" gap="$3">
                {/* Logo de la app */}
                <YStack
                  w={40}
                  h={40}
                  br={20}
                  bg="white"
                  jc="center"
                  ai="center"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                >
                  <Image
                    source={require('../../../assets/images/icon.png')}
                    style={{ width: 32, height: 32 }}
                    resizeMode="contain"
                  />
                </YStack>
                {/* Nombre de la app y saludo */}
                <YStack gap="$1">
                  <Text
                    color="white"
                    fontSize="$6"
                    fontWeight="bold"
                    style={{
                      textShadowColor: 'rgba(0,0,0,0.3)',
                      textShadowOffset: { width: 1, height: 1 },
                      textShadowRadius: 2,
                    }}
                  >
                    OneCalama
                  </Text>
                  {user && (
                    <Text
                      color="rgba(255,255,255,0.9)"
                      fontSize="$3"
                      style={{
                        textShadowColor: 'rgba(0,0,0,0.2)',
                        textShadowOffset: { width: 1, height: 1 },
                        textShadowRadius: 1,
                      }}
                    >
                      Hola, <UserDisplay variant="first-name" color="rgba(255,255,255,0.9)" />
                    </Text>
                  )}
                </YStack>
              </XStack>
            ) : (
              /* Información de pantalla específica */
              <XStack ai="center" gap="$3">
                {screenIcon && (
                  <YStack
                    w={36}
                    h={36}
                    br={18}
                    bg="rgba(255,255,255,0.15)"
                    jc="center"
                    ai="center"
                  >
                    <Ionicons name={screenIcon} size={20} color="white" />
                  </YStack>
                )}

                <YStack gap="$1">
                  <Text
                    color="white"
                    fontSize="$5"
                    fontWeight="bold"
                    style={{
                      textShadowColor: 'rgba(0,0,0,0.3)',
                      textShadowOffset: { width: 1, height: 1 },
                      textShadowRadius: 2,
                    }}
                  >
                    {screenTitle}
                  </Text>
                  {screenSubtitle && (
                    <Text
                      color="rgba(255,255,255,0.8)"
                      fontSize="$2"
                      style={{
                        textShadowColor: 'rgba(0,0,0,0.2)',
                        textShadowOffset: { width: 1, height: 1 },
                        textShadowRadius: 1,
                      }}
                    >
                      {screenSubtitle}
                    </Text>
                  )}
                </YStack>
              </XStack>
            )}
          </XStack>

          {/* Lado derecho - Botones de acción */}
          <XStack ai="center" gap="$2">
            {/* Notificaciones */}
            {showNotifications && (
              <Button
                size="$3"
                circular
                bg="rgba(255,255,255,0.1)"
                pressStyle={{
                  bg: "rgba(255,255,255,0.2)",
                  scale: 0.95
                }}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                  position: 'relative',
                }}
              >
                <Ionicons name="notifications-outline" size={20} color="white" />

                {/* Badge de notificaciones */}
                {notificationCount > 0 && (
                  <YStack
                    position="absolute"
                    top={-4}
                    right={-4}
                    w={18}
                    h={18}
                    br={9}
                    bg="#ff4444"
                    jc="center"
                    ai="center"
                    style={{
                      borderWidth: 2,
                      borderColor: '#E67E22',
                    }}
                  >
                    <Text
                      color="white"
                      fontSize="$1"
                      fontWeight="bold"
                    >
                      {notificationCount > 9 ? '9+' : notificationCount.toString()}
                    </Text>
                  </YStack>
                )}
              </Button>
            )}

            {/* Información del usuario y logout */}
            {showLogout && user && (
              <XStack ai="center" gap="$2">
                {/* Avatar del usuario */}
                <UserAvatar size={32} />

                {/* Botón de logout */}
                <Button
                  size="$3"
                  circular
                  bg="rgba(255,255,255,0.1)"
                  onPress={handleLogout}
                  pressStyle={{
                    bg: "rgba(255,255,255,0.2)",
                    scale: 0.95
                  }}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <Ionicons name="log-out-outline" size={18} color="white" />
                </Button>
              </XStack>
            )}
          </XStack>
        </XStack>

        {/* Indicador de admin (si aplica) */}
        {user?.es_administrador && (
          <XStack mt="$2" ai="center" gap="$1">
            <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.8)" />
            <Text 
              color="rgba(255,255,255,0.8)" 
              fontSize="$1" 
              fontWeight="600"
            >
              Administrador
            </Text>
          </XStack>
        )}
      </YStack>
    </>
  );
}