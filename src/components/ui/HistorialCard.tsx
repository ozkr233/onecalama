// src/components/ui/HistorialCard.tsx - VERSIÓN PULIDA CON TAMA GUI
import React, { useState } from 'react'
import { TouchableOpacity, Image } from 'react-native'
import { Text, YStack, XStack, Card, styled } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { HistorialDenuncia, Evidencia } from '../../types/historial'
import { formatearFecha, getEstadoColor, getEstadoTexto } from '../../utils/formatters'
import { StatusChip } from './statusChip'
interface HistorialCardProps {
  denuncia: HistorialDenuncia
  onPress?: (denuncia: HistorialDenuncia) => void
  onEvidenciaPress?: (evidencia: Evidencia) => void
  isFirst?: boolean
  isLast?: boolean
}

// ====== PRIMITIVAS DE ESTILO (consistentes con tus tokens) ======
const Surface = styled(Card, {
  backgroundColor: '$surface',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: '$gray6',
  shadowColor: 'rgba(0,0,0,0.10)',
  shadowRadius: 8,
  shadowOpacity: 1,
  elevation: 3,
  padding: '$4',
})

const Chip = styled(XStack, {
  backgroundColor: '$gray2',
  paddingHorizontal: '$3',
  paddingVertical: '$1.5',
  borderRadius: 999,
  alignItems: 'center',
  gap: '$2',
  variants: {
    tone: {
      primary: { backgroundColor: '$primary' },
      secondary: { backgroundColor: '$secondary' },
      success: { backgroundColor: '$success' },
      warning: { backgroundColor: '$warning' },
      info: { backgroundColor: '$info' },
      muted: { backgroundColor: '$gray2' },
      custom: {} as any, // permite pasar style inline (ej: backgroundColor dinámico)
    },
    contrast: {
      light: {},
      dark: {},
    },
  } as const,
})

const ChipText = styled(Text, {
  fontSize: '$2',
  fontWeight: '700',
  color: '$textSecondary',
  variants: {
    invert: {
      true: { color: 'white' },
      false: { color: '$textSecondary' },
    },
  } as const,
})

const Title = styled(Text, {
  fontSize: '$5',
  lineHeight: 22,
  fontWeight: '800',
  color: '$textPrimary',
})

const Meta = styled(Text, {
  fontSize: '$2',
  color: '$textSecondary',
})

const CircleBtn = styled(TouchableOpacity, {
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.55)',
})

// ====== HELPERS ======
// Construir URL completa de Cloudinary
const construirUrlCompleta = (rutaRelativa: string): string => {
  if (!rutaRelativa) return ''
  if (rutaRelativa.startsWith('http')) return rutaRelativa
  return `https://res.cloudinary.com/de06451wd/${rutaRelativa}`
}

// Normalizar colores del estado (usa tu getEstadoColor)
const normalizeEstadoColors = (estado: HistorialDenuncia['estado']) => {
  const raw: any = getEstadoColor(estado)

  if (typeof raw === 'object' && raw?.main) {
    return {
      main: raw.main,
      border: raw.border || 'rgba(0,0,0,0.08)',
      shadow: raw.shadow || 'rgba(0,0,0,0.25)',
    }
  }

  if (typeof raw === 'string') {
    return {
      main: raw,
      border: 'rgba(0,0,0,0.08)',
      shadow: 'rgba(0,0,0,0.25)',
    }
  }

  return {
    main: 'rgba(107,114,128,0.8)',
    border: 'rgba(107,114,128,1)',
    shadow: 'rgba(107,114,128,0.4)',
  }
}

// ====== EVIDENCIA (solo imagen / doc / video), sin overlay de texto ======
const EvidenciaDisplay: React.FC<{
  evidencias: Evidencia[]
  onEvidenciaPress?: (evidencia: Evidencia) => void
}> = ({ evidencias, onEvidenciaPress }) => {
  const [indiceActual, setIndiceActual] = useState(0)

  if (!evidencias || evidencias.length === 0) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$2">
        <Ionicons name="image-outline" size={48} color="#ccc" />
        <Meta>Sin evidencias</Meta>
      </YStack>
    )
  }

  const evidenciaActual = evidencias[indiceActual]
  const totalEvidencias = evidencias.length

  const goPrev = () => setIndiceActual((prev) => Math.max(0, prev - 1))
  const goNext = () => setIndiceActual((prev) => Math.min(totalEvidencias - 1, prev + 1))

  return (
    <YStack flex={1} position="relative" height={160}>
      <TouchableOpacity
        onPress={() => onEvidenciaPress?.(evidenciaActual)}
        style={{ flex: 1 }}
        activeOpacity={0.92}
        accessibilityLabel={`Evidencia ${indiceActual + 1} de ${totalEvidencias}`}
      >
        {evidenciaActual.tipo === 'imagen' ? (
          <Image
            source={{ uri: construirUrlCompleta(evidenciaActual.url) }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          // Vista para documentos/videos
          <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$gray2" gap="$3">
            <Card backgroundColor="$gray6" padding="$4" borderRadius="$4">
              <Ionicons
                name={evidenciaActual.tipo === 'video' ? 'videocam' : 'document-text'}
                size={48}
                color="#666"
              />
            </Card>

            <YStack alignItems="center" gap="$1" maxWidth="80%">
              <Text fontSize="$4" fontWeight="700" color="$textPrimary" textAlign="center" numberOfLines={2}>
                {evidenciaActual.nombre}
              </Text>
              <Meta textAlign="center">
                {evidenciaActual.tipo === 'video' ? 'Video' : 'Documento'}
                {evidenciaActual.size && ` • ${Math.round(evidenciaActual.size / 1024)} KB`}
              </Meta>
            </YStack>

            <Card backgroundColor="$primary" paddingHorizontal="$4" paddingVertical="$2" borderRadius="$3">
              <XStack alignItems="center" gap="$2">
                <Ionicons name={evidenciaActual.tipo === 'video' ? 'play' : 'open'} size={16} color="white" />
                <Text color="white" fontSize="$3" fontWeight="700">
                  {evidenciaActual.tipo === 'video' ? 'Reproducir' : 'Abrir'}
                </Text>
              </XStack>
            </Card>
          </YStack>
        )}
      </TouchableOpacity>

      {/* Controles y dots SOLO si hay múltiples evidencias (sin texto) */}
      {totalEvidencias > 1 && (
        <>
          {/* Flecha anterior */}
          {indiceActual > 0 && (
            <CircleBtn
              onPress={goPrev}
              style={{ position: 'absolute', left: 8, top: '50%', transform: [{ translateY: -20 }] }}
              accessibilityLabel="Evidencia anterior"
            >
              <Ionicons name="chevron-back" size={20} color="white" />
            </CircleBtn>
          )}

          {/* Flecha siguiente */}
          {indiceActual < totalEvidencias - 1 && (
            <CircleBtn
              onPress={goNext}
              style={{ position: 'absolute', right: 8, top: '50%', transform: [{ translateY: -20 }] }}
              accessibilityLabel="Siguiente evidencia"
            >
              <Ionicons name="chevron-forward" size={20} color="white" />
            </CircleBtn>
          )}

          {/* Degradado inferior para legibilidad de los dots */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)']}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 36 }}
          />

          {/* Dots de paginación */}
          <XStack
            position="absolute"
            bottom="$2"
            left="50%"
            gap="$1.5"
            // centrado aproximado: 10px por dot (8px + gap)
            style={{ transform: [{ translateX: -((totalEvidencias * 10) / 2) }] }}
          >
            {evidencias.map((_, index) => (
              <TouchableOpacity key={index} onPress={() => setIndiceActual(index)} activeOpacity={0.8}>
                <Card
                  width={8}
                  height={8}
                  borderRadius="$10"
                  backgroundColor={index === indiceActual ? 'white' : 'rgba(255,255,255,0.4)'}
                />
              </TouchableOpacity>
            ))}
          </XStack>
        </>
      )}
    </YStack>
  )
}

// ====== CARD PRINCIPAL ======
export default function HistorialCard({
  denuncia,
  onPress,
  onEvidenciaPress,
  isFirst,
  isLast,
}: HistorialCardProps) {
  // Respuestas
  const respuestasNoLeidas = denuncia.respuestas?.filter((r) => !r.leida).length || 0

  // Colores del estado
  const estadoColors = normalizeEstadoColors(denuncia.estado)

  // Tiempo transcurrido
  const calcularTiempoTranscurrido = (fecha: string): string => {
    try {
      const fechaCreacion = new Date(fecha)
      const ahora = new Date()
      const diferencia = ahora.getTime() - fechaCreacion.getTime()
      const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))

      if (dias === 0) return 'Hoy'
      if (dias === 1) return 'Ayer'
      if (dias < 7) return `Hace ${dias} días`
      if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`
      return formatearFecha(fecha)
    } catch {
      return formatearFecha(fecha)
    }
  }

  return (
    <TouchableOpacity onPress={() => onPress?.(denuncia)} activeOpacity={0.9}>
      <Surface
        pressStyle={{ scale: 0.98 }}
        style={{
          ...(isFirst && { marginTop: 8 }),
          ...(isLast && { marginBottom: 24 }),
        }}
      >
        <YStack gap="$3">
          {/* Fila Superior: Código y Estado */}
          <XStack justifyContent="space-between" alignItems="center">
            <Chip tone="muted">
              <Ionicons name="pricetag-outline" size={14} color="#6b7280" />
              <ChipText># {denuncia.codigo || denuncia.id}</ChipText>
            </Chip>

           <StatusChip estado={getEstadoTexto(denuncia.estado)}  size="sm" />
          </XStack>

          {/* Título + tiempo */}
          <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
            <YStack flex={1}>
              <Title numberOfLines={2}>{denuncia.titulo || 'Sin título'}</Title>
            </YStack>

            <Chip tone="muted">
              <Ionicons name="time-outline" size={14} color="#6b7280" />
              <ChipText>{calcularTiempoTranscurrido(denuncia.fechaCreacion)}</ChipText>
            </Chip>
          </XStack>

          {/* Evidencia principal */}
          <Card borderRadius="$3" borderWidth={1} borderColor="$gray6" overflow="hidden">
            <EvidenciaDisplay evidencias={denuncia.evidencias || []} onEvidenciaPress={onEvidenciaPress} />
          </Card>

          {/* Dirección y categoría */}
          <XStack gap="$3">
            <Chip tone="muted" flex={1}>
              <Ionicons name="location-outline" size={14} color="#6b7280" />
              <ChipText numberOfLines={1}>{denuncia.ubicacion?.direccion || 'Sin ubicación'}</ChipText>
            </Chip>

            <Chip tone="secondary">
              <Ionicons name="folder-outline" size={14} color="white" />
              <ChipText invert>{denuncia.categoria}</ChipText>
            </Chip>
          </XStack>

          {/* Indicador de nuevas respuestas */}
          {respuestasNoLeidas > 0 && (
            <Card backgroundColor="$red2" borderColor="$red10" borderWidth={1} padding="$3" borderRadius="$3">
              <XStack alignItems="center" gap="$2">
                <Ionicons name="notifications" size={14} color="#dc2626" />
                <Text fontSize="$2" color="$red10" fontWeight="700">
                  {respuestasNoLeidas === 1
                    ? 'Nueva respuesta disponible'
                    : `${respuestasNoLeidas} respuestas nuevas`}
                </Text>
              </XStack>
            </Card>
          )}
        </YStack>
      </Surface>
    </TouchableOpacity>
  )
}
