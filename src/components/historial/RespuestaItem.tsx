// src/components/historial/RespuestaItem.tsx - MEJORADO CON EVIDENCIAS
import React, { useState } from 'react';
import { Card, XStack, YStack, Text, Button, Image, ScrollView } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Respuesta, Evidencia } from '../../types/historial';
import { formatearFecha, formatearTamanoArchivo } from '../../utils/formatters';

interface RespuestaItemProps {
  respuesta: Respuesta;
  onMarcarComoLeida?: (respuestaId: string) => void;
  onVerEvidencia?: (evidencia: Evidencia) => void;
}

const { width } = Dimensions.get('window');

export const RespuestaItem: React.FC<RespuestaItemProps> = ({
  respuesta,
  onMarcarComoLeida,
  onVerEvidencia
}) => {
  const [mostrarEvidencias, setMostrarEvidencias] = useState(false);

  const handleMarcarLeida = () => {
    if (onMarcarComoLeida && !respuesta.leida) {
      onMarcarComoLeida(respuesta.id);
    }
  };

  const getEvidenciaIcon = (tipo: string) => {
    switch (tipo) {
      case 'imagen':
        return 'image';
      case 'documento':
        return 'document-text';
      case 'video':
        return 'videocam';
      default:
        return 'attach';
    }
  };

  const handleDescargarEvidencia = (evidencia: Evidencia) => {
    // TODO: Implementar descarga real
    Alert.alert(
      'Descargar evidencia',
      `¿Deseas descargar "${evidencia.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Descargar',
          onPress: () => {
            console.log('Descargando evidencia:', evidencia.url);
            // Aquí iría la lógica de descarga
          }
        }
      ]
    );
  };

  return (
    <Card
      elevate
      p="$4"
      mb="$3"
      bg={respuesta.esRespuestaOficial ? '$blue1' : '$gray1'}
      borderLeftWidth={4}
      borderLeftColor={respuesta.esRespuestaOficial ? '$primary' : '$gray6'}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <YStack gap="$3">
        {/* Header con autor y fecha */}
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack gap="$1" flex={1}>
            <XStack alignItems="center" gap="$2">
              <Ionicons
                name={respuesta.esRespuestaOficial ? "shield-checkmark" : "person"}
                size={16}
                color="#E67E22"
              />
              <Text fontSize="$4" fontWeight="bold" color="$textPrimary">
                {respuesta.autorRespuesta}
              </Text>
              {respuesta.esRespuestaOficial && (
                <Card bg="$primary" px="$2" py="$1" br="$2">
                  <Text fontSize="$1" color="white" fontWeight="bold">
                    OFICIAL
                  </Text>
                </Card>
              )}
            </XStack>
            <Text fontSize="$2" color="$textSecondary">
              {respuesta.cargoAutor}
              {respuesta.departamento && ` • ${respuesta.departamento}`}
            </Text>
          </YStack>

          <YStack alignItems="flex-end" gap="$1">
            <Text fontSize="$2" color="$textSecondary">
              {formatearFecha(respuesta.fechaRespuesta)}
            </Text>
            {!respuesta.leida && (
              <Card bg="$red10" w={8} h={8} br="$10" />
            )}
          </YStack>
        </XStack>

        {/* Contenido de la respuesta */}
        <Text fontSize="$3" color="$textPrimary" lineHeight="$4">
          {respuesta.contenido}
        </Text>

        {/* Evidencias */}
        {respuesta.evidencias.length > 0 && (
          <YStack gap="$3">
            <XStack alignItems="center" justifyContent="space-between">
              <XStack alignItems="center" gap="$2">
                <Ionicons name="attach" size={16} color="#667eea" />
                <Text fontSize="$3" fontWeight="bold" color="#667eea">
                  Evidencias adjuntas ({respuesta.evidencias.length})
                </Text>
              </XStack>
              <Button
                size="$2"
                variant="outlined"
                onPress={() => setMostrarEvidencias(!mostrarEvidencias)}
                iconAfter={
                  <Ionicons
                    name={mostrarEvidencias ? "chevron-up" : "chevron-down"}
                    size={16}
                  />
                }
              >
                {mostrarEvidencias ? 'Ocultar' : 'Ver'}
              </Button>
            </XStack>

            {mostrarEvidencias && (
              <YStack gap="$2">
                {/* Vista de cuadrícula para imágenes */}
                {respuesta.evidencias.filter(e => e.tipo === 'imagen').length > 0 && (
                  <YStack gap="$2">
                    <Text fontSize="$3" fontWeight="600" color="$textPrimary">
                      📷 Imágenes
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <XStack gap="$2">
                        {respuesta.evidencias
                          .filter(e => e.tipo === 'imagen')
                          .map((evidencia) => (
                          <TouchableOpacity
                            key={evidencia.id}
                            onPress={() => onVerEvidencia?.(evidencia)}
                          >
                            <Card
                              w={100}
                              h={100}
                              bg="$gray2"
                              br="$3"
                              overflow="hidden"
                              borderWidth={1}
                              borderColor="$gray6"
                            >
                              {evidencia.url ? (
                                <Image
                                  source={{ uri: evidencia.url }}
                                  width="100%"
                                  height="100%"
                                  resizeMode="cover"
                                />
                              ) : (
                                <YStack f={1} ai="center" jc="center">
                                  <Ionicons name="image" size={24} color="#999" />
                                </YStack>
                              )}
                            </Card>
                          </TouchableOpacity>
                        ))}
                      </XStack>
                    </ScrollView>
                  </YStack>
                )}

                {/* Lista de documentos y videos */}
                {respuesta.evidencias.filter(e => e.tipo !== 'imagen').map((evidencia) => (
                  <TouchableOpacity
                    key={evidencia.id}
                    onPress={() => handleDescargarEvidencia(evidencia)}
                  >
                    <Card
                      p="$3"
                      bg="white"
                      borderWidth={1}
                      borderColor="$gray6"
                      pressStyle={{ scale: 0.98 }}
                    >
                      <XStack alignItems="center" gap="$3">
                        <Card bg="$gray2" p="$2" br="$2">
                          <Ionicons
                            name={getEvidenciaIcon(evidencia.tipo)}
                            size={20}
                            color="#667eea"
                          />
                        </Card>

                        <YStack flex={1} gap="$1">
                          <Text fontSize="$3" fontWeight="600" color="$textPrimary">
                            {evidencia.nombre}
                          </Text>
                          <XStack alignItems="center" gap="$2">
                            <Text fontSize="$2" color="$textSecondary">
                              {evidencia.tipo.charAt(0).toUpperCase() + evidencia.tipo.slice(1)}
                            </Text>
                            {evidencia.size && (
                              <>
                                <Text fontSize="$2" color="$textSecondary">•</Text>
                                <Text fontSize="$2" color="$textSecondary">
                                  {formatearTamanoArchivo(evidencia.size)}
                                </Text>
                              </>
                            )}
                          </XStack>
                        </YStack>

                        <XStack gap="$2">
                          <Button
                            size="$2"
                            variant="outlined"
                            circular
                            onPress={() => onVerEvidencia?.(evidencia)}
                          >
                            <Ionicons name="eye" size={16} />
                          </Button>
                          <Button
                            size="$2"
                            bg="$primary"
                            circular
                            onPress={() => handleDescargarEvidencia(evidencia)}
                          >
                            <Ionicons name="download" size={16} color="white" />
                          </Button>
                        </XStack>
                      </XStack>
                    </Card>
                  </TouchableOpacity>
                ))}
              </YStack>
            )}
          </YStack>
        )}

        {/* Acciones */}
        <XStack justifyContent="space-between" alignItems="center" mt="$2">
          <XStack alignItems="center" gap="$2">
            {respuesta.esRespuestaOficial && (
              <Card bg="$green2" px="$2" py="$1" br="$2">
                <Text fontSize="$1" color="$green11" fontWeight="bold">
                  ✓ RESPUESTA OFICIAL
                </Text>
              </Card>
            )}
          </XStack>

          {!respuesta.leida && (
            <Button
              size="$2"
              bg="$primary"
              onPress={handleMarcarLeida}
            >
              <Ionicons name="checkmark" size={14} color="white" />
              <Text color="white" ml="$1" fontSize="$2">
                Marcar como leída
              </Text>
            </Button>
          )}
        </XStack>
      </YStack>
    </Card>
  );
};