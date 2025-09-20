// src/components/historial/ResumenEstadistico.tsx
import React from 'react';
import { Text, YStack, XStack, Card, H4 } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { EstadisticasHistorial } from '../../types/historial';

interface ResumenEstadisticoProps {
  estadisticas: EstadisticasHistorial;
}

export const ResumenEstadistico: React.FC<ResumenEstadisticoProps> = ({ estadisticas }) => {

  // Calcular denuncias no resueltas
  const noResueltas = estadisticas.totalDenuncias - estadisticas.resueltas - estadisticas.pendientes;

  // Calcular porcentaje de resolución
  const porcentajeResolucion = estadisticas.totalDenuncias > 0
    ? Math.round((estadisticas.resueltas / estadisticas.totalDenuncias) * 100)
    : 0;

  return (
    <Card elevate p="$4" gap="$4" mx="$4" mb="$4" mt="$3">
      <YStack gap="$3">
        {/* Header */}
        <XStack alignItems="center" gap="$2">
          <Ionicons name="stats-chart" size={20} color="#E67E22" />
          <H4 color="$textPrimary">📊 Resumen de mis denuncias</H4>
        </XStack>

        {/* Grid de estadísticas principales */}
        <XStack gap="$3">
          {/* Total */}
          <Card flex={1} bg="$blue2" p="$3" br="$3" borderWidth={1} borderColor="$blue6">
            <YStack alignItems="center" gap="$2">
              <XStack alignItems="center" gap="$2">
                <Ionicons name="document-text" size={24} color="#3B82F6" />
                <Text fontSize="$6" fontWeight="bold" color="#3B82F6">
                  {estadisticas.totalDenuncias}
                </Text>
              </XStack>
              <Text fontSize="$3" color="#1E40AF" fontWeight="600" textAlign="center">
                Total
              </Text>
            </YStack>
          </Card>

          {/* Resueltas */}
          <Card flex={1} bg="$green2" p="$3" br="$3" borderWidth={1} borderColor="$green6">
            <YStack alignItems="center" gap="$2">
              <XStack alignItems="center" gap="$2">
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text fontSize="$6" fontWeight="bold" color="#10B981">
                  {estadisticas.resueltas}
                </Text>
              </XStack>
              <Text fontSize="$3" color="#047857" fontWeight="600" textAlign="center">
                Resueltas
              </Text>
            </YStack>
          </Card>
        </XStack>

        <XStack gap="$3">
          {/* Pendientes */}
          <Card flex={1} bg="$orange2" p="$3" br="$3" borderWidth={1} borderColor="$orange6">
            <YStack alignItems="center" gap="$2">
              <XStack alignItems="center" gap="$2">
                <Ionicons name="time" size={24} color="#F59E0B" />
                <Text fontSize="$6" fontWeight="bold" color="#F59E0B">
                  {estadisticas.pendientes}
                </Text>
              </XStack>
              <Text fontSize="$3" color="#D97706" fontWeight="600" textAlign="center">
                Pendientes
              </Text>
            </YStack>
          </Card>

          {/* No resueltas */}
          <Card flex={1} bg="$gray4" p="$3" br="$3" borderWidth={1} borderColor="$gray7">
            <YStack alignItems="center" gap="$2">
              <XStack alignItems="center" gap="$2">
                <Ionicons name="help-circle" size={24} color="#6B7280" />
                <Text fontSize="$6" fontWeight="bold" color="#6B7280">
                  {noResueltas}
                </Text>
              </XStack>
              <Text fontSize="$3" color="#4B5563" fontWeight="600" textAlign="center">
                No resuelto
              </Text>
            </YStack>
          </Card>
        </XStack>

        {/* Barra de progreso */}
        <YStack gap="$2">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$3" color="$textPrimary" fontWeight="600">
              Progreso de resolución
            </Text>
            <Text fontSize="$4" color="$textPrimary" fontWeight="bold">
              {porcentajeResolucion}%
            </Text>
          </XStack>

          <YStack
            height={8}
            backgroundColor="$gray4"
            borderRadius="$2"
            overflow="hidden"
          >
            <YStack
              height="100%"
              backgroundColor="#10B981"
              width={`${porcentajeResolucion}%`}
              borderRadius="$2"
              style={{
                shadowColor: '#10B981',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 2,
              }}
            />
          </YStack>
        </YStack>
      </YStack>
    </Card>
  );
};