// src/components/historial/DenunciaCard.tsx
import React from 'react';
import { Card, XStack, YStack, Text, Button, Badge } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { HistorialDenuncia } from '../../types/historial';
import { formatearFecha } from '../../utils/formatters';

interface DenunciaCardProps {
  denuncia: HistorialDenuncia;
  onPress: (denuncia: HistorialDenuncia) => void;
  tieneRespuestasNoLeidas?: boolean;
}

export const DenunciaCard: React.FC<DenunciaCardProps> = ({
  denuncia,
  onPress,
  tieneRespuestasNoLeidas = false
}) => {
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return '$orange9';
      case 'en_proceso': return '$blue9';
      case 'resuelto': return '$green9';
      case 'rechazado': return '$red9';
      case 'cerrado': return '$gray9';
      default: return '$gray9';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_proceso': return 'En Proceso';
      case 'resuelto': return 'Resuelto';
      case 'rechazado': return 'Rechazado';
      case 'cerrado': return 'Cerrado';
      default: return estado;
    }
  };

  const getPrioridadIcon = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'alert-circle';
      case 'alta': return 'chevron-up-circle';
      case 'media': return 'remove-circle';
      case 'baja': return 'chevron-down-circle';
      default: return 'remove-circle';
    }
  };

  return (
    <Card
      elevate
      p="$4"
      mb="$3"
      bg="white"
      borderWidth={tieneRespuestasNoLeidas ? 2 : 0}
      borderColor={tieneRespuestasNoLeidas ? '$primary' : 'transparent'}
      pressStyle={{ scale: 0.98 }}
      onPress={() => onPress(denuncia)}
    >
      <YStack gap="$3">
        {/* Header con número de folio y estado */}
        <XStack justifyContent="space-between" alignItems="center">
          <XStack alignItems="center" gap="$2">
            <Text fontSize="$4" fontWeight="bold" color="$textPrimary">
              #{denuncia.numeroFolio}
            </Text>
            {tieneRespuestasNoLeidas && (
              <Badge size="$2" bg="$primary" color="white">
                Nueva respuesta
              </Badge>
            )}
          </XStack>
          <XStack alignItems="center" gap="$2">
            <Ionicons
              name={getPrioridadIcon(denuncia.prioridad)}
              size={16}
              color={getEstadoColor(denuncia.estado)}
            />
            <Badge bg={getEstadoColor(denuncia.estado)} color="white">
              {getEstadoTexto(denuncia.estado)}
            </Badge>
          </XStack>
        </XStack>

        {/* Título y descripción */}
        <YStack gap="$1">
          <Text fontSize="$5" fontWeight="600" color="$textPrimary">
            {denuncia.titulo}
          </Text>
          <Text fontSize="$3" color="$textSecondary" numberOfLines={2}>
            {denuncia.descripcion}
          </Text>
        </YStack>

        {/* Información adicional */}
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$2" color="$textSecondary">
            {formatearFecha(denuncia.fechaCreacion)}
          </Text>
          <XStack alignItems="center" gap="$4">
            {denuncia.evidenciasIniciales.length > 0 && (
              <XStack alignItems="center" gap="$1">
                <Ionicons name="attach" size={14} color="#757575" />
                <Text fontSize="$2" color="$textSecondary">
                  {denuncia.evidenciasIniciales.length}
                </Text>
              </XStack>
            )}
            {denuncia.respuestas.length > 0 && (
              <XStack alignItems="center" gap="$1">
                <Ionicons name="chatbubble" size={14} color="#757575" />
                <Text fontSize="$2" color="$textSecondary">
                  {denuncia.respuestas.length}
                </Text>
              </XStack>
            )}
          </XStack>
        </XStack>

        {/* Ubicación si existe */}
        {denuncia.ubicacion && (
          <XStack alignItems="center" gap="$1">
            <Ionicons name="location" size={14} color="#757575" />
            <Text fontSize="$2" color="$textSecondary" numberOfLines={1}>
              {denuncia.ubicacion.direccion}
            </Text>
          </XStack>
        )}
      </YStack>
    </Card>
  );
};


