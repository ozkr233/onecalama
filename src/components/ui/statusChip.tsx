// src/components/ui/StatusChip.tsx
import React from 'react'
import { XStack, Text, styled } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'

// Puedes ampliar estos literales según tus estados reales del backend
type EstadoKey =
  | 'RECIBIDA' | 'RECEIVED'
  | 'EN_PROCESO' | 'IN_PROGRESS'
  | 'RESUELTA' | 'RESUELTO'
  | 'PENDIENTE' | 'PENDING'
  | 'NO_RESUELTA' | 'NO_RESUELTO' | 'NOT_RESOLVED'
  | string

type Variant = 'soft' | 'solid' | 'outline'
type Size = 'sm' | 'md'

const Pill = styled(XStack, {
  alignItems: 'center',
  gap: '$2',
  borderRadius: 999,
  paddingHorizontal: '$3',
  paddingVertical: '$1.5',
})

const Label = styled(Text, {
  fontWeight: '800',
  fontSize: '$2',
})

function normalizeEstadoKey(raw: string): EstadoKey {
  if (!raw) return 'PENDIENTE'
  const k = raw
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[ÁÀÂÄ]/g, 'A')
    .replace(/[ÉÈÊË]/g, 'E')
    .replace(/[ÍÌÎÏ]/g, 'I')
    .replace(/[ÓÒÔÖ]/g, 'O')
    .replace(/[ÚÙÛÜ]/g, 'U')
  return k as EstadoKey
}

function getThemeByEstado(estado: EstadoKey) {
  // Mapea a tu paleta de tokens
  switch (estado) {
    case 'RECIBIDA':
    case 'RECEIVED':
      return {
        label: 'Recibida',
        icon: 'download-outline' as const,
        bgSoft: '$statusReceived',
        textSoft: '$primaryDark',
        border: '$primary',
        solidBg: '$primary',
        solidText: 'white',
      }
    case 'EN_PROCESO':
    case 'IN_PROGRESS':
      return {
        label: 'En progreso',
        icon: 'sync-outline' as const,
        bgSoft: '$statusInProgress',
        textSoft: '$municipalDark',
        border: '$info',
        solidBg: '$info',
        solidText: 'white',
      }
    case 'RESUELTA':
    case 'RESUELTO':
      return {
        label: 'Resuelta',
        icon: 'checkmark-circle-outline' as const,
        bgSoft: '$statusResolved',
        textSoft: '$successDark',
        border: '$success',
        solidBg: '$success',
        solidText: 'white',
      }
    case 'PENDIENTE':
    case 'PENDING':
      return {
        label: 'Pendiente',
        icon: 'time-outline' as const,
        bgSoft: '$statusPending',
        textSoft: '$warning',
        border: '$warning',
        solidBg: '$warning',
        solidText: 'white',
      }
    case 'NO_RESUELTA':
    case 'NO_RESUELTO':
    case 'NOT_RESOLVED':
      return {
        label: 'No resuelta',
        icon: 'close-circle-outline' as const,
        bgSoft: '$statusNotResolved',
        textSoft: '$error',
        border: '$error',
        solidBg: '$error',
        solidText: 'white',
      }
    default:
      return {
        label: estado?.toString().replace(/_/g, ' ').toLowerCase() || 'Estado',
        icon: 'ellipse-outline' as const,
        bgSoft: '$gray2',
        textSoft: '$textSecondary',
        border: '$gray6',
        solidBg: '$municipalLight',
        solidText: 'white',
      }
  }
}

export interface StatusChipProps {
  estado: string
  variant?: Variant
  size?: Size
  showIcon?: boolean
}

export const StatusChip: React.FC<StatusChipProps> = ({
  estado,
  variant = 'soft',
  size = 'sm',
  showIcon = true,
}) => {
  const k = normalizeEstadoKey(estado)
  const t = getThemeByEstado(k)
  const isSoft = variant === 'soft'
  const isSolid = variant === 'solid'
  const isOutline = variant === 'outline'

  const padY = size === 'sm' ? '$1.5' : '$2'
  const padX = size === 'sm' ? '$3' : '$3.5'
  const iconSize = size === 'sm' ? 14 : 16

  const bg = isSoft ? t.bgSoft : isSolid ? t.solidBg : 'transparent'
  const color = isSoft ? t.textSoft : isSolid ? t.solidText : t.textSoft
  const borderColor = isOutline ? t.border : 'transparent'
  const borderWidth = isOutline ? 1 : 0

  return (
    <Pill
      backgroundColor={bg as any}
      borderColor={borderColor as any}
      borderWidth={borderWidth}
      paddingHorizontal={padX}
      paddingVertical={padY}
    >
      {showIcon && <Ionicons name={t.icon} size={iconSize} color={String(color)} />}
      <Label color={color as any}>{t.label}</Label>
    </Pill>
  )
}
