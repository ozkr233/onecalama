// src/components/ui/HistorialCard.tsx - VERSIÓN ELEGANTE ADAPTADA
import React from 'react';
import { Text, YStack, XStack, H5 } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from './GlassCard';
import { HistorialDenuncia } from '../../types/historial';
import { formatearFecha, getEstadoColor, getEstadoTexto } from '../../utils/formatters';

interface HistorialCardProps {
  denuncia: HistorialDenuncia; // ✅ CORREGIDO: denuncia en lugar de item
  onPress?: (denuncia: HistorialDenuncia) => void; // ✅ CORREGIDO: función opcional
}

// ✅ FUNCIÓN PARA NORMALIZAR COLORES DEL ESTADO
const normalizeEstadoColors = (estado: HistorialDenuncia['estado']) => {
  const raw: any = getEstadoColor(estado);
  
  // Si getEstadoColor devuelve un objeto, usarlo
  if (typeof raw === 'object' && raw?.main) {
    return {
      main: raw.main,
      border: raw.border || 'rgba(0,0,0,0.08)',
      shadow: raw.shadow || 'rgba(0,0,0,0.25)',
    };
  }
  
  // Si devuelve string, crear objeto
  if (typeof raw === 'string') {
    return {
      main: raw,
      border: 'rgba(0,0,0,0.08)',
      shadow: 'rgba(0,0,0,0.25)',
    };
  }
  
  // Fallback por defecto
  return {
    main: 'rgba(107,114,128,0.8)',
    border: 'rgba(107,114,128,1)',
    shadow: 'rgba(107,114,128,0.4)',
  };
};

// ✅ FUNCIÓN SEGURA PARA OBTENER RESPUESTAS
const getRespuestasSafe = (respuestas: any) => (Array.isArray(respuestas) ? respuestas : []);

// ✅ Header con gradiente
function HistorialHeader({
  item,
  estadoColor,
  respuestasNoLeidas,
}: {
  item: HistorialDenuncia;
  estadoColor: string;
  respuestasNoLeidas: number;
}) {
  const folio = item.codigo || `#${item.id ?? '—'}`; // ✅ Usar codigo del backend

  return (
    <LinearGradient
      colors={[estadoColor, estadoColor + 'CC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ paddingHorizontal: 16, paddingVertical: 16 }}
    >
      <YStack space="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$4" color="white" fontWeight="800">
            {folio}
          </Text>

          <YStack
            backgroundColor="rgba(255,255,255,0.25)"
            paddingHorizontal="$4"
            paddingVertical="$2"
            borderRadius="$4"
            borderWidth={1}
            borderColor="rgba(255,255,255,0.4)"
            alignItems="center"
          >
            <Text color="white" fontSize="$3" fontWeight="800">
              {getEstadoTexto(item.estado)}
            </Text>
          </YStack>
        </XStack>

        {/* ✅ INDICADOR DE RESPUESTAS MUNICIPALES NUEVAS */}
        {respuestasNoLeidas > 0 && (
          <XStack justifyContent="flex-start">
            <YStack
              backgroundColor="rgba(255,255,255,0.95)"
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius="$4"
              borderWidth={1}
              borderColor="rgba(255,255,255,0.6)"
              shadowColor="rgba(0,0,0,0.3)"
              shadowRadius={6}
              elevation={4}
            >
              <XStack alignItems="center" space="$1">
                <Text fontSize="$3">🔔</Text>
                <Text color={estadoColor} fontSize="$2" fontWeight="800">
                  {respuestasNoLeidas === 1 ? 'Nueva respuesta' : `${respuestasNoLeidas} respuestas nuevas`}
                </Text>
              </XStack>
            </YStack>
          </XStack>
        )}
      </YStack>
    </LinearGradient>
  );
}

// ✅ Metadata (fecha, respuestas, ubicación, departamento)
function HistorialMetadata({
  item,
  estadoColors,
  ultimaRespuesta,
  respuestasNoLeidas,
}: {
  item: HistorialDenuncia;
  estadoColors: { main: string; border: string; shadow: string };
  ultimaRespuesta: any;
  respuestasNoLeidas: number;
}) {
  const respuestas = getRespuestasSafe(item.respuestas);

  return (
    <YStack space="$3">
      <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$2">
        {/* Fecha de creación */}
        <YStack
          backgroundColor={estadoColors.main}
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$3"
          borderWidth={1}
          borderColor={estadoColors.border}
          shadowColor={estadoColors.shadow}
          shadowRadius={4}
          elevation={3}
        >
          <XStack alignItems="center" space="$2">
            <Ionicons name="calendar-outline" size={14} color="white" />
            <Text fontSize="$2" color="white" fontWeight="800">
              {formatearFecha(item.fechaCreacion)}
            </Text>
          </XStack>
        </YStack>

        {/* Respuestas si existen */}
        {respuestas.length > 0 && (
          <YStack
            backgroundColor={
              respuestasNoLeidas > 0 ? 'rgba(220, 38, 38, 0.8)' : estadoColors.main
            }
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius="$3"
            borderWidth={1}
            borderColor={
              respuestasNoLeidas > 0 ? 'rgba(220, 38, 38, 1)' : estadoColors.border
            }
            shadowColor={
              respuestasNoLeidas > 0 ? 'rgba(220, 38, 38, 0.4)' : estadoColors.shadow
            }
            shadowRadius={4}
            elevation={3}
          >
            <XStack alignItems="center" space="$2">
              <Ionicons
                name={respuestasNoLeidas > 0 ? 'mail' : 'mail-open-outline'}
                size={14}
                color="white"
              />
              <Text fontSize="$2" color="white" fontWeight="800">
                {respuestas.length} respuesta{respuestas.length !== 1 ? 's' : ''}
              </Text>
            </XStack>
          </YStack>
        )}

        {/* Departamento asignado */}
        {item.departamentoAsignado && (
          <YStack
            backgroundColor={estadoColors.main}
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius="$3"
            borderWidth={1}
            borderColor={estadoColors.border}
            shadowColor={estadoColors.shadow}
            shadowRadius={4}
            elevation={3}
          >
            <XStack alignItems="center" space="$2">
              <Ionicons name="business-outline" size={14} color="white" />
              <Text fontSize="$2" color="white" fontWeight="800">
                {item.departamentoAsignado}
              </Text>
            </XStack>
          </YStack>
        )}
      </XStack>

      {/* Categoría */}
      <XStack justifyContent="flex-start">
        <YStack
          backgroundColor="rgba(107, 114, 128, 0.1)"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$3"
          borderWidth={1}
          borderColor="rgba(107, 114, 128, 0.2)"
        >
          <XStack alignItems="center" space="$2">
            <Ionicons name="folder-outline" size={14} color="#6B7280" />
            <Text fontSize="$2" color="$gray11" fontWeight="600">
              {item.categoria}
            </Text>
          </XStack>
        </YStack>
      </XStack>

      {/* Ubicación si existe */}
      {item.ubicacion?.direccion && (
        <YStack
          backgroundColor={estadoColors.main}
          padding="$3"
          borderRadius="$3"
          borderWidth={1}
          borderColor={estadoColors.border}
          shadowColor={estadoColors.shadow}
          shadowRadius={4}
          elevation={3}
        >
          <XStack alignItems="center" space="$2">
            <Ionicons name="location-outline" size={16} color="white" />
            <Text fontSize="$3" color="white" numberOfLines={2} flex={1} fontWeight="700">
              {item.ubicacion.direccion}
            </Text>
          </XStack>
        </YStack>
      )}

      {/* ✅ Preview de última respuesta municipal si existe */}
      {ultimaRespuesta && (
        <YStack
          backgroundColor="rgba(59, 130, 246, 0.1)"
          padding="$3"
          borderRadius="$3"
          borderLeftWidth={4}
          borderLeftColor="rgba(59, 130, 246, 0.8)"
        >
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$1">
            <XStack alignItems="center" space="$2">
              <Ionicons name="chatbubble-outline" size={14} color="#3B82F6" />
              <Text fontSize="$2" color="$blue11" fontWeight="700">
                {ultimaRespuesta.autor || 'Municipalidad'}
              </Text>
            </XStack>
            <Text fontSize="$1" color="$blue10">
              {formatearFecha(ultimaRespuesta.fechaRespuesta)}
            </Text>
          </XStack>
          
          <Text 
            fontSize="$3" 
            color="$blue12" 
            numberOfLines={2}
            lineHeight="$4"
            fontWeight="500"
          >
            {ultimaRespuesta.mensaje || 'Sin mensaje'}
          </Text>
        </YStack>
      )}

      {/* ✅ Calificación de satisfacción si existe */}
      {item.satisfaccionCiudadano && (
        <XStack justifyContent="center" alignItems="center" space="$2">
          <Text fontSize="$2" color="$gray10" fontWeight="600">Tu calificación:</Text>
          <XStack space="$0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name="star"
                size={16}
                color={star <= item.satisfaccionCiudadano! ? "#f59e0b" : "#d1d5db"}
              />
            ))}
          </XStack>
          <Text fontSize="$2" color="$amber10" fontWeight="700">
            {item.satisfaccionCiudadano}/5
          </Text>
        </XStack>
      )}
    </YStack>
  );
}

// ✅ Componente principal
export default function HistorialCard({ denuncia: item, onPress }: HistorialCardProps) {
  // ✅ VALIDACIÓN: Verificar que item existe
  if (!item) {
    console.warn('⚠️ HistorialCard: item es null/undefined');
    return null;
  }

  const respuestas = getRespuestasSafe(item.respuestas);
  const respuestasNoLeidas = respuestas.filter((r: any) => r?.leida === false).length;
  const ultimaRespuesta = respuestas.length ? respuestas[respuestas.length - 1] : null;
  const estadoColors = normalizeEstadoColors(item.estado);
  const estadoColorForHeader = estadoColors.main;

  // ✅ MANEJADOR DE CLICK CORREGIDO
  const handlePress = () => {
    if (onPress) {
      onPress(item);
    }
  };

  return (
    <GlassCard
      variant="default"
      intensity="medium"
      animated
      style={{ marginBottom: 16, marginHorizontal: 16, overflow: 'hidden' }}
      onPress={handlePress}
    >
      <YStack>
        {/* Header con gradiente del estado */}
        <HistorialHeader
          item={item}
          estadoColor={estadoColorForHeader}
          respuestasNoLeidas={respuestasNoLeidas}
        />

        {/* Contenido principal */}
        <YStack padding="$4" space="$4">
          {/* Título */}
          <H5 fontSize="$5" numberOfLines={2} color="$gray12" fontWeight="800" lineHeight="$5">
            {item.titulo || 'Sin título'}
          </H5>

          {/* Descripción */}
          <Text fontSize="$3" color="$gray11" numberOfLines={3} lineHeight="$5" opacity={0.9}>
            {item.descripcion || 'Sin descripción'}
          </Text>

          {/* Metadatos */}
          <HistorialMetadata
            item={item}
            estadoColors={estadoColors}
            ultimaRespuesta={ultimaRespuesta}
            respuestasNoLeidas={respuestasNoLeidas}
          />
        </YStack>
      </YStack>
    </GlassCard>
  );
}