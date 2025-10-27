import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { Button, H5, Text, XStack, YStack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

import { Evidencia, Respuesta } from '../../types/historial';
import { RespuestaItem } from '../historial/RespuestaItem';
import LoadingSpinner from '../ui/Loading';

type Props = {
  respuestas?: Respuesta[] | null;
  loading?: boolean;
  error?: string | null;
  refreshing: boolean;
  onRefresh: () => Promise<void> | void;
  onVerEvidencia: (evidencia: Evidencia) => void;
  onCalificarMunicipal?: (respuestaId: string, puntuacion: 1 | 2 | 3 | 4 | 5) => Promise<void>;
};

export function DenunciaResponsesTab({
  respuestas,
  loading = false,
  error,
  refreshing,
  onRefresh,
  onVerEvidencia,
  onCalificarMunicipal,
}: Props) {
  const totalRespuestas = respuestas?.length ?? 0;
  const hasResponses = totalRespuestas > 0;


  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#E67E22']}
          tintColor="#E67E22"
        />
      }
    >
      <YStack padding="$4">
        {loading ? (
          <YStack alignItems="center" gap="$3" padding="$6">
            <LoadingSpinner size="large" />
            <Text fontSize="$3" color="$gray11">
              Cargando respuestas...
            </Text>
          </YStack>
        ) : error ? (
          <YStack alignItems="center" gap="$3" padding="$6">
            <Ionicons name="warning" size={48} color="#f59e0b" />
            <Text fontSize="$4" color="$gray11" textAlign="center">
              No pudimos cargar las respuestas
            </Text>
            <Text fontSize="$3" color="$gray9" textAlign="center">
              {error}
            </Text>
            <Button size="$3" variant="outlined" onPress={onRefresh}>
              <Ionicons name="refresh" size={16} />
              <Text marginLeft="$2">Reintentar</Text>
            </Button>
          </YStack>
        ) : !hasResponses ? (
          <YStack alignItems="center" gap="$4" padding="$6">
            <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
            <Text fontSize="$4" color="$gray11" textAlign="center">
              Sin respuestas aún
            </Text>
            <Text fontSize="$3" color="$gray9" textAlign="center">
              Aún no se han emitido respuestas para esta denuncia
            </Text>
          </YStack>
        ) : (
          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <H5 color="$textPrimary">
                Respuestas ({totalRespuestas})
              </H5>
              <Button size="$3" variant="outlined" onPress={onRefresh}>
                <Ionicons name="refresh" size={16} />
              </Button>
            </XStack>

            {(respuestas || []).map((respuesta, index) => (
              <RespuestaItem
                key={respuesta.id || index}
                respuesta={respuesta}
                onVerEvidencia={onVerEvidencia}
                onCalificarMunicipal={onCalificarMunicipal}
              />
            ))}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}

