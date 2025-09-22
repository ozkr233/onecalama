// src/components/ui/HistorialCard.tsx
import React, { useState } from 'react'
import { Image } from 'react-native'
import { Text, YStack, XStack, Card, styled } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { HistorialDenuncia, Evidencia } from '../../types/historial'
import { formatearFecha, getEstadoColor, getEstadoTexto } from '../../utils/formatters'
import { StatusChip } from './statusChip' // Asegúrate de tener el componente StatusChip.tsx

interface HistorialCardProps {
  denuncia: HistorialDenuncia
  onPress?: (denuncia: HistorialDenuncia) => void
  onEvidenciaPress?: (evidencia: Evidencia) => void
  isFirst?: boolean
  isLast?: boolean
}

// ====== PRIMITIVAS DE ESTILO ======
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
})

const ChipText = styled(Text, {
  fontSize: '$2',
  fontWeight: '700',
  color: '$textSecondary',
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

const CircleBtn = styled(Card, {
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.55)',
  pressStyle: { scale: 0.96 },
  cursor: 'pointer',
})

// ====== HELPERS ======
const construirUrlCompleta = (rutaRelativa: string): string => {
  if (!rutaRelativa) return ''
  if (rutaRelativa.startsWith('http')) return rutaRelativa
  return `https://res.cloudinary.com/de06451wd/${rutaRelativa}`
}

const normalizeEstadoColors = (estado: HistorialDenuncia['estado']) => {
  const raw: any = getEstadoColor(estado)
  if (typeof raw === 'object' && raw?.main) return { main: raw.main, border: raw.border || 'rgba(0,0,0,0.08)' }
  if (typeof raw === 'string') return { main: raw, border: 'rgba(0,0,0,0.08)' }
  return { main: 'rgba(107,114,128,0.8)', border: 'rgba(107,114,128,1)' }
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
  const goPrev = () => setIndiceActual((p) => Math.max(0, p - 1))
  const goNext = () => setIndiceActual((p) => Math.min(totalEvidencias - 1, p + 1))

  return (
    <YStack flex={1} position="relative" height={160}>
      <Card
        onPress={() => onEvidenciaPress?.(evidenciaActual)}
        backgroundColor="$surface"
        pressStyle={{ scale: 0.995 }}
        cursor="pointer"
        style={{ flex: 1 }}
        accessibilityRole="imagebutton"
        accessibilityLabel={`Evidencia ${indiceActual + 1} de ${totalEvidencias}`}
      >
        {evidenciaActual.tipo === 'imagen' ? (
          <Image
            source={{ uri: construirUrlCompleta(evidenciaActual.url) }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$gray2" gap="$3">
            <Card backgroundColor="$gray6" padding="$4" borderRadius="$4">
              <Ionicons name={evidenciaActual.tipo === 'video' ? 'videocam' : 'document-text'} size={48} color="#666" />
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
      </Card>

      {totalEvidencias > 1 && (
        <>
          {indiceActual > 0 && (
            <CircleBtn
              onPress={goPrev}
              style={{ position: 'absolute', left: 8, top: '50%', transform: [{ translateY: -20 }] }}
              accessibilityLabel="Evidencia anterior"
            >
              <Ionicons name="chevron-back" size={20} color="white" />
            </CircleBtn>
          )}
          {indiceActual < totalEvidencias - 1 && (
            <CircleBtn
              onPress={goNext}
              style={{ position: 'absolute', right: 8, top: '50%', transform: [{ translateY: -20 }] }}
              accessibilityLabel="Siguiente evidencia"
            >
              <Ionicons name="chevron-forward" size={20} color="white" />
            </CircleBtn>
          )}

          {/* Degradado inferior + dots (sin texto) */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)']}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 36 }}
          />
          <XStack
            position="absolute"
            bottom="$2"
            left="50%"
            gap="$1.5"
            style={{ transform: [{ translateX: -((totalEvidencias * 10) / 2) }] }}
          >
            {evidencias.map((_, index) => (
              <Card
                key={index}
                onPress={() => setIndiceActual(index)}
                pressStyle={{ scale: 0.9 }}
                width={8}
                height={8}
                borderRadius="$10"
                backgroundColor={index === indiceActual ? 'white' : 'rgba(255,255,255,0.4)'}
                cursor="pointer"
              />
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
  const respuestasNoLeidas = denuncia.respuestas?.filter((r) => !r.leida).length || 0
  const estadoColors = normalizeEstadoColors(denuncia.estado)

  const calcularTiempoTranscurrido = (fecha: string): string => {
    try {
      const f = new Date(fecha)
      const now = new Date()
      const diff = now.getTime() - f.getTime()
      const dias = Math.floor(diff / (1000 * 60 * 60 * 24))
      if (dias === 0) return 'Hoy'
      if (dias === 1) return 'Ayer'
      if (dias < 7) return `Hace ${dias} días`
      if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`
      return formatearFecha(fecha)
    } catch {
      return formatearFecha(fecha)
    }
  }

  // onPress funciona en Surface (Tamagui) para habilitar pressStyle
  const handleCardPress = () => {
    onPress?.(denuncia)
  }

  function buildDireccion(pub: any): string {
  const partes: string[] = [];

  // 1) Fuentes “obvias”
  if (pub?.nombre_calle) partes.push(String(pub.nombre_calle));
  if (pub?.numero_calle) partes.push(String(pub.numero_calle));

  // 2) Variantes comunes del backend
  const posiblesStrings = [
    pub?.direccion,
    pub?.direccion_texto,
    pub?.direccion_completa,
    pub?.referencias, // a veces el usuario pone la descripción del lugar aquí
    pub?.ubicacion?.direccion,
    pub?.ubicacion?.address,
    pub?.ubicacion?.descripcion,
    typeof pub?.ubicacion === 'string' ? pub.ubicacion : undefined,
  ].filter(Boolean) as string[];

  // Toma la primera no vacía que no sea redundante
  for (const s of posiblesStrings) {
    const clean = String(s).trim();
    if (clean && !partes.includes(clean)) {
      partes.push(clean);
      break;
    }
  }

  // 3) Junta vecinal / sector
  if (pub?.junta_vecinal?.villa) partes.push(String(pub.junta_vecinal.villa));

  // 4) Si no hay nada legible, cae a coordenadas (si existen)
  if (partes.length === 0) {
    const lat = pub?.latitud ?? pub?.lat ?? pub?.ubicacion?.latitud ?? pub?.ubicacion?.lat;
    const lng = pub?.longitud ?? pub?.lng ?? pub?.lon ?? pub?.ubicacion?.longitud ?? pub?.ubicacion?.lng ?? pub?.ubicacion?.lon;

    const toN = (v: any) =>
      typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) : NaN;

    if (Number.isFinite(toN(lat)) && Number.isFinite(toN(lng))) {
      // último recurso: muestra lat/lng con 5 decimales
      return `(${toN(lat).toFixed(5)}, ${toN(lng).toFixed(5)})`;
    }
  }

  return partes.length ? partes.join(' ') : 'Dirección no especificada';
}

  return (
    <Surface
      onPress={handleCardPress}
      animation="quick"
      pressStyle={{ scale: 0.98, shadowRadius: 4 }}
      hoverStyle={{ y: -1, shadowRadius: 10 }}
      focusStyle={{ outlineWidth: 0 }}
      cursor="pointer"
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${denuncia.titulo || 'denuncia'}`}
      style={{
        ...(isFirst && { marginTop: 8 }),
        ...(isLast && { marginBottom: 24 }),
      }}
    >
      <YStack gap="$3">
        {/* Fila Superior: Código y Estado */}
        <XStack justifyContent="space-between" alignItems="center">
          <Chip>
            <Ionicons name="pricetag-outline" size={14} color="#6b7280" />
            <ChipText># {denuncia.codigo || denuncia.id}</ChipText>
          </Chip>

          {/* Estado con paleta municipal */}
          <StatusChip estado={getEstadoTexto(denuncia.estado)} variant="soft" size="sm" />
        </XStack>

        {/* Título + tiempo */}
        <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
          <YStack flex={1}>
            <Title numberOfLines={2}>{denuncia.titulo || 'Sin título'}</Title>
          </YStack>

          <Chip>
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
          <Chip style={{ flex: 1 }}>
            <Ionicons name="location-outline" size={14} color="#6b7280" />
            <ChipText numberOfLines={1}>{denuncia.ubicacion?.direccion || 'Sin ubicación'}</ChipText>
          </Chip>

          <Chip style={{ backgroundColor: '$secondary' }}>
            <Ionicons name="folder-outline" size={14} color="white" />
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '800' }}>{denuncia.categoria}</Text>
          </Chip>
        </XStack>

        {/* Indicador de nuevas respuestas */}
        {respuestasNoLeidas > 0 && (
          <Card backgroundColor="$red2" borderColor="$red10" borderWidth={1} padding="$3" borderRadius="$3">
            <XStack alignItems="center" gap="$2">
              <Ionicons name="notifications" size={14} color="#dc2626" />
              <Text fontSize="$2" color="$red10" fontWeight="700">
                {respuestasNoLeidas === 1 ? 'Nueva respuesta disponible' : `${respuestasNoLeidas} respuestas nuevas`}
              </Text>
            </XStack>
          </Card>
        )}
      </YStack>
    </Surface>
  )
}
