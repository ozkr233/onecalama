import React from 'react';
import { Alert, RefreshControl, ScrollView } from 'react-native';
import { Button, Card, H4, H5, Text, XStack, YStack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

import SatisfactionSurvey from '../ui/SatisfactionSurvey';
import { RespuestaItem } from '../historial/RespuestaItem';
import { Evidencia, HistorialDenuncia } from '../../types/historial';
import { formatearFechaCompleta, getEstadoColor, getEstadoTexto } from '../../utils/formatters';

type Props = {
  denuncia: HistorialDenuncia;
  refreshing: boolean;
  onRefresh: () => Promise<void> | void;
  onRate: (rating: number) => void;
  onVerEvidencia: (evidencia: Evidencia) => void;
  onDebugEvidencias: () => void;
  buildEvidenceUrl: (rutaRelativa: string) => string;
};

export function DenunciaDetailsTab({
  denuncia,
  refreshing,
  onRefresh,
  onRate,
  onVerEvidencia,
  onDebugEvidencias,
  buildEvidenceUrl,
}: Props) {
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
      <YStack padding="$4" gap="$4">
        <Card elevate bordered>
          <YStack padding="$4" gap="$3">
            <XStack justifyContent="space-between" alignItems="flex-start">
              <YStack flex={1}>
                <Text fontSize="$2" color="$gray11" fontWeight="500" marginBottom="$1">
                  {denuncia.codigo}
                </Text>
                <H4 color="$textPrimary" marginBottom="$2">
                  {denuncia.titulo}
                </H4>
                <Text fontSize="$3" color="$textSecondary" lineHeight="$5">
                  {denuncia.descripcion}
                </Text>
              </YStack>
              <Text
                fontSize="$2"
                color="white"
                backgroundColor={getEstadoColor(denuncia.estado).main}
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$3"
                fontWeight="600"
              >
                {getEstadoTexto(denuncia.estado)}
              </Text>
            </XStack>
          </YStack>
        </Card>

        <Card elevate bordered>
          <YStack padding="$4" gap="$3">
            <H5 color="$textPrimary">Información Adicional</H5>

            <XStack gap="$4" flexWrap="wrap">
              <YStack gap="$1">
                <Text fontSize="$2" color="$gray11">Categoría</Text>
                <Text fontSize="$3" color="$textPrimary" fontWeight="500">
                  {denuncia.categoria}
                </Text>
              </YStack>

              <YStack gap="$1">
                <Text fontSize="$2" color="$gray11">Fecha de Creación</Text>
                <Text fontSize="$3" color="$textPrimary" fontWeight="500">
                  {formatearFechaCompleta(denuncia.fechaCreacion)}
                </Text>
              </YStack>

              {denuncia.departamentoAsignado && (
                <YStack gap="$1">
                  <Text fontSize="$2" color="$gray11">Departamento Asignado</Text>
                  <Text fontSize="$3" color="$textPrimary" fontWeight="500">
                    {denuncia.departamentoAsignado}
                  </Text>
                </YStack>
              )}
            </XStack>
          </YStack>
        </Card>

        <Card elevate bordered>
          <YStack padding="$4" gap="$3">
            <XStack alignItems="center" gap="$2">
              <Ionicons name="map" size={20} color="#E67E22" />
              <H5 color="$textPrimary">Ubicación</H5>
            </XStack>

            <YStack gap="$2">
              <XStack justifyContent="space-between">
                <Text fontSize="$2" color="$gray11">Nombre Calle:</Text>
                <Text fontSize="$2" color="$textPrimary" fontWeight="500">
                  {(denuncia as any).nombreCalle || 'No especificado'}
                </Text>
              </XStack>

              <XStack justifyContent="space-between">
                <Text fontSize="$2" color="$gray11">Número Calle:</Text>
                <Text fontSize="$2" color="$textPrimary" fontWeight="500">
                  {(denuncia as any).numeroCalle || 'No especificado'}
                </Text>
              </XStack>

              <XStack justifyContent="space-between">
                <Text fontSize="$2" color="$gray11">Junta Vecinal:</Text>
                <Text fontSize="$2" color="$textPrimary" fontWeight="500">
                  {(denuncia as any).juntaVecinal || 'No especificada'}
                </Text>
              </XStack>

              <XStack justifyContent="space-between">
                <Text fontSize="$2" color="$blue11" fontWeight="500">
                  Coordenadas:
                </Text>
                <Text fontSize="$2" color="$blue10" fontFamily="$mono">
                  Latitud: {(denuncia as any).latitud || 'No disponible'}
                </Text>
                <Text fontSize="$2" color="$blue10" fontFamily="$mono">
                  Longitud: {(denuncia as any).longitud || 'No disponible'}
                </Text>
              </XStack>
            </YStack>
          </YStack>
        </Card>

        <Card elevate bordered>
          <YStack padding="$4" gap="$3">
            <XStack alignItems="center" justifyContent="space-between">
              <XStack alignItems="center" gap="$2">
                <Ionicons name="attach" size={20} color="#E67E22" />
                <H5 color="$textPrimary">Evidencias ({denuncia.evidencias?.length || 0})</H5>
              </XStack>

              <Button size="$2" variant="outlined" onPress={onDebugEvidencias}>
                <Ionicons name="bug" size={16} />
                <Text fontSize="$2">Debug</Text>
              </Button>
            </XStack>

            {denuncia.evidencias && denuncia.evidencias.length > 0 ? (
              <YStack gap="$2">
                {denuncia.evidencias.map((evidencia, index) => (
                  <Card
                    key={evidencia.id || index}
                    backgroundColor="$gray2"
                    padding="$3"
                    borderRadius="$3"
                    pressStyle={{ backgroundColor: '$gray3' }}
                    onPress={() => onVerEvidencia(evidencia)}
                  >
                    <XStack alignItems="center" gap="$3">
                      <Ionicons
                        name={
                          evidencia.tipo === 'imagen'
                            ? 'image'
                            : evidencia.tipo === 'video'
                            ? 'videocam'
                            : 'document-text'
                        }
                        size={24}
                        color="#667eea"
                      />
                      <YStack flex={1}>
                        <Text fontSize="$3" fontWeight="500">
                          {evidencia.nombre}
                        </Text>
                        <Text fontSize="$2" color="$gray9">
                          {evidencia.tipo.charAt(0).toUpperCase() + evidencia.tipo.slice(1)}
                          {evidencia.size && ` · ${Math.round(evidencia.size / 1024)} KB`}
                        </Text>
                        <Text fontSize="$1" color="$gray8" fontFamily="$mono">
                          URL: {evidencia.url}
                        </Text>
                      </YStack>
                      <YStack alignItems="center" gap="$1">
                        <Button
                          size="$2"
                          variant="outlined"
                          onPress={() => {
                            const urlCompleta = buildEvidenceUrl(evidencia.url);
                            console.log('?? [DEBUG] URL completa:', urlCompleta);
                            Alert.alert('URL Debug', urlCompleta);
                          }}
                        >
                          <Text fontSize="$1">URL</Text>
                        </Button>
                        <Ionicons name="chevron-forward" size={16} color="#ccc" />
                      </YStack>
                    </XStack>
                  </Card>
                ))}
              </YStack>
            ) : (
              <YStack alignItems="center" padding="$4" backgroundColor="$gray2" borderRadius="$3">
                <Ionicons name="image-outline" size={48} color="#ccc" />
                <Text fontSize="$3" color="$gray11" textAlign="center">
                  No hay evidencias disponibles
                </Text>
                <Text fontSize="$2" color="$gray9" textAlign="center">
                  Esta denuncia no tiene archivos adjuntos
                </Text>
              </YStack>
            )}
          </YStack>
        </Card>

        {denuncia.respuestas && denuncia.respuestas.length > 0 && (
          <Card elevate bordered>
            <YStack padding="$4" gap="$3">
              <XStack alignItems="center" gap="$2">
                <Ionicons name="chatbubbles" size={20} color="#E67E22" />
                <H5 color="$textPrimary">Respuestas ({denuncia.respuestas.length})</H5>
              </XStack>

              <YStack gap="$3">
                {denuncia.respuestas.map((respuesta, index) => (
                  <RespuestaItem
                    key={respuesta.id || index}
                    respuesta={respuesta}
                    onVerEvidencia={onVerEvidencia}
                  />
                ))}
              </YStack>
            </YStack>
          </Card>
        )}

        {denuncia.estado === 'resuelto' && (
          <Card elevate bordered>
            <YStack padding="$4" gap="$3">
              <H5 color="$textPrimary">Calificar Servicio</H5>
              <SatisfactionSurvey
                onRate={onRate}
                currentRating={denuncia.satisfaccionCiudadano}
                disabled={!!denuncia.satisfaccionCiudadano}
              />
            </YStack>
          </Card>
        )}
      </YStack>
    </ScrollView>
  );
}
