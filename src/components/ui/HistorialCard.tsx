// src/components/ui/HistorialCard.tsx
import React from 'react';
import { Text, YStack, XStack, H5 } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from './GlassCard';
import { HistorialDenuncia } from '../../types/historial';
import { formatearFecha, getEstadoColor, getEstadoTexto } from '../../utils/formatters';

interface HistorialCardProps {
  item: HistorialDenuncia;
  onPress: (item: HistorialDenuncia) => void;
}

// Componente para el header con gradiente
function HistorialHeader({ item, estadoColor, respuestasNoLeidas }: {
  item: HistorialDenuncia;
  estadoColor: string;
  respuestasNoLeidas: number;
}) {
  return (
    <LinearGradient
      colors={[estadoColor, estadoColor + 'CC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 16,
      }}
    >
      <YStack space="$3">
        {/* Primera fila: Folio y Estado */}
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$4" color="white" fontWeight="800">
            {item.numeroFolio}
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

        {/* Segunda fila: Nueva respuesta (si existe) */}
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
                <Text
                  color={estadoColor}
                  fontSize="$2"
                  fontWeight="800"
                >
                  Nueva respuesta
                </Text>
              </XStack>
            </YStack>
          </XStack>
        )}
      </YStack>
    </LinearGradient>
  );
}

// Componente para los metadatos
function HistorialMetadata({ item, estadoColors, ultimaRespuesta, respuestasNoLeidas }: {
  item: HistorialDenuncia;
  estadoColors: any;
  ultimaRespuesta: any;
  respuestasNoLeidas: number;
}) {
  return (
    <YStack space="$3">
      {/* Fecha y respuestas con color del estado */}
      <XStack justifyContent="space-between" alignItems="center">
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

        {ultimaRespuesta && (
          <YStack
            backgroundColor={respuestasNoLeidas > 0 ? "rgba(220, 38, 38, 0.8)" : estadoColors.main}
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius="$3"
            borderWidth={1}
            borderColor={respuestasNoLeidas > 0 ? "rgba(220, 38, 38, 1)" : estadoColors.border}
            shadowColor={respuestasNoLeidas > 0 ? "rgba(220, 38, 38, 0.4)" : estadoColors.shadow}
            shadowRadius={4}
            elevation={3}
          >
            <XStack alignItems="center" space="$2">
              <Ionicons
                name={respuestasNoLeidas > 0 ? "mail" : "mail-open-outline"}
                size={14}
                color="white"
              />
              <Text
                fontSize="$2"
                color="white"
                fontWeight="800"
              >
                {item.respuestas.length} respuesta{item.respuestas.length !== 1 ? 's' : ''}
              </Text>
            </XStack>
          </YStack>
        )}
      </XStack>

      {/* Ubicación con color del estado */}
      {item.ubicacion && (
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
    </YStack>
  );
}

// Componente principal de la tarjeta
export default function HistorialCard({ item, onPress }: HistorialCardProps) {
  const respuestasNoLeidas = item.respuestas.filter(resp => !resp.leida).length;
  const ultimaRespuesta = item.respuestas[item.respuestas.length - 1];
  const estadoColor = getEstadoColor(item.estado);

  // Función para obtener colores dinámicos según estado
  const getEstadoColors = (estado: string) => {
    switch (estado) {
      case 'resuelto':
        return {
          main: 'rgba(34, 197, 94, 0.8)', // Verde
          border: 'rgba(34, 197, 94, 1)',
          shadow: 'rgba(34, 197, 94, 0.4)'
        };
      case 'pendiente':
        return {
          main: 'rgba(245, 158, 11, 0.8)', // Naranja/Amarillo
          border: 'rgba(245, 158, 11, 1)',
          shadow: 'rgba(245, 158, 11, 0.4)'
        };
      case 'en_proceso':
        return {
          main: 'rgba(245, 158, 11, 0.8)', // Naranja/Amarillo
          border: 'rgba(245, 158, 11, 1)',
          shadow: 'rgba(245, 158, 11, 0.4)'
        };
      case 'rechazado':
        return {
          main: 'rgba(107, 114, 128, 0.8)', // Gris (No resuelto)
          border: 'rgba(107, 114, 128, 1)',
          shadow: 'rgba(107, 114, 128, 0.4)'
        };
      case 'cerrado':
        return {
          main: 'rgba(107, 114, 128, 0.8)', // Gris (No resuelto)
          border: 'rgba(107, 114, 128, 1)',
          shadow: 'rgba(107, 114, 128, 0.4)'
        };
      default:
        return {
          main: 'rgba(107, 114, 128, 0.8)', // Gris por defecto
          border: 'rgba(107, 114, 128, 1)',
          shadow: 'rgba(107, 114, 128, 0.4)'
        };
    }
  };
  const estadoColors = getEstadoColors(item.estado);

  return (
    <GlassCard
      variant="default"
      intensity="medium"
      animated
      style={{
        marginBottom: 16,
        marginHorizontal: 16,
        overflow: 'hidden'
      }}
      onPress={() => onPress(item)}
    >
      <YStack>
        {/* Header con color sólido del estado */}
        <HistorialHeader
          item={item}
          estadoColor={estadoColor}
          respuestasNoLeidas={respuestasNoLeidas}
        />

        {/* Contenido principal */}
        <YStack padding="$4" space="$4">
          {/* Título */}
          <H5 fontSize="$5" numberOfLines={2} color="$gray12" fontWeight="800" lineHeight="$5">
            {item.titulo}
          </H5>

          {/* Descripción */}
          <Text
            fontSize="$3"
            color="$gray11"
            numberOfLines={3}
            lineHeight="$5"
            opacity={0.9}
          >
            {item.descripcion}
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