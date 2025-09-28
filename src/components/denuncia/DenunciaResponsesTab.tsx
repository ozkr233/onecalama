import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { Button, H5, Text, XStack, YStack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

import { Evidencia, Respuesta } from '../../types/historial';
import { RespuestaItem } from '../historial/RespuestaItem';

type Props = {
  respuestas?: Respuesta[] | null;
  refreshing: boolean;
  onRefresh: () => Promise<void> | void;
  onMarcarRespuestaLeida: (respuestaId: string) => void;
  onVerEvidencia: (evidencia: Evidencia) => void;
};

export function DenunciaResponsesTab({
  respuestas,
  refreshing,
  onRefresh,
  onMarcarRespuestaLeida,
  onVerEvidencia,
}: Props) {
  const hasResponses = respuestas && respuestas.length > 0;

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
        {!hasResponses ? (
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
                Respuestas ({respuestas?.length ?? 0})
              </H5>
              <Button size="$3" variant="outlined" onPress={onRefresh}>
                <Ionicons name="refresh" size={16} />
              </Button>
            </XStack>

            {respuestas?.map((respuesta, index) => (
              <RespuestaItem
                key={respuesta.id || index}
                respuesta={respuesta}
                onMarcarComoLeida={onMarcarRespuestaLeida}
                onVerEvidencia={onVerEvidencia}
              />
            ))}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}
