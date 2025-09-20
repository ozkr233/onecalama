// src/components/historial/RespuestaItem.tsx - VERSIÓN COMPLETA Y CORREGIDA
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
      bg={respuesta.esOficial ? '$blue1' : '$gray1'}
      borderLeftWidth={4}
      borderLeftColor={respuesta.esOficial ? '$primary' : '$gray6'}
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
                name={respuesta.esOficial ? "shield-checkmark" : "person"}
                size={16}
                color="#E67E22"
              />
              <Text fontSize="$4" fontWeight="bold" color="$textPrimary">
                {respuesta.autor}
              </Text>
              {respuesta.esOficial && (
                <Card bg="$primary" px="$2" py="$1" br="$2">
                  <Text fontSize="$1" color="white" fontWeight="bold">
                    OFICIAL
                  </Text>
                </Card>
              )}
            </XStack>
            <Text fontSize="$2" color="$textSecondary">
              {respuesta.tipo === 'respuesta' ? 'Respuesta' : 
               respuesta.tipo === 'actualizacion' ? 'Actualización' : 'Resolución'}
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
          {respuesta.mensaje}
        </Text>

        {/* Evidencias */}
        {respuesta.evidencias && respuesta.evidencias.length > 0 && (
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

            {/* Lista de evidencias */}
            {mostrarEvidencias && (
              <YStack gap="$2">
                {respuesta.evidencias.map((evidencia, index) => (
                  <TouchableOpacity
                    key={evidencia.id || index}
                    onPress={() => onVerEvidencia && onVerEvidencia(evidencia)}
                  >
                    <Card
                      bg="$gray2"
                      p="$3"
                      br="$3"
                      borderWidth={1}
                      borderColor="$borderColor"
                    >
                      <XStack alignItems="center" gap="$3">
                        {/* Icono de tipo de archivo */}
                        <Card bg="$blue2" p="$2" br="$2">
                          <Ionicons
                            name={getEvidenciaIcon(evidencia.tipo)}
                            size={20}
                            color="#667eea"
                          />
                        </Card>

                        {/* Información del archivo */}
                        <YStack flex={1} gap="$1">
                          <Text fontSize="$3" fontWeight="bold" color="$textPrimary">
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

                        {/* Botones de acción */}
                        <XStack gap="$2">
                          <Button
                            size="$2"
                            circular
                            bg="$blue5"
                            onPress={() => onVerEvidencia && onVerEvidencia(evidencia)}
                          >
                            <Ionicons name="eye" size={16} color="white" />
                          </Button>
                          <Button
                            size="$2"
                            circular
                            bg="$gray5"
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

        {/* Acción para marcar como leída */}
        {!respuesta.leida && (
          <XStack justifyContent="flex-end">
            <Button
              size="$2"
              variant="outlined"
              onPress={handleMarcarLeida}
            >
              <Ionicons name="checkmark" size={16} />
              <Text ml="$1">Marcar como leída</Text>
            </Button>
          </XStack>
        )}
      </YStack>
    </Card>
  );
};

// Exportación por defecto también por compatibilidad
export default RespuestaItem;