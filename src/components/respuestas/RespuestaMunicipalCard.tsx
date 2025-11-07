// src/components/respuestas/RespuestaMunicipalCard.tsx
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Card, XStack, YStack, Text, H5, Button } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { RespuestaMunicipalFormateada } from '../../services/respuestasMunicipales';
import { formatearFecha } from '../../utils/formatters';
import { EmojiRating } from '../ui/EmojiRating';

interface Props {
  respuesta: RespuestaMunicipalFormateada;
  onPress?: (respuesta: RespuestaMunicipalFormateada) => void;
  onCalificar?: (respuestaId: number, puntuacion: 1 | 2 | 3 | 4 | 5) => Promise<void>;
  mostrarPublicacion?: boolean;
  compacto?: boolean;
}

export const RespuestaMunicipalCard: React.FC<Props> = ({
  respuesta,
  onPress,
  onCalificar,
  mostrarPublicacion = true,
  compacto = false
}) => {
  const [calificando, setCalificando] = useState(false);

  const handleCalificar = async (puntuacion: 1 | 2 | 3 | 4 | 5) => {
    if (!onCalificar) return;

    try {
      setCalificando(true);
      await onCalificar(respuesta.id, puntuacion);
      Alert.alert('¡Gracias!', 'Tu calificación ha sido registrada.');
    } catch (error) {
      console.error('Error calificando respuesta:', error);
      Alert.alert('Error', 'No se pudo enviar la calificación. Intenta nuevamente.');
    } finally {
      setCalificando(false);
    }
  };

  const handleEmojiChange = (v: 1 | 2 | 3 | 4 | 5) => {
    if (!respuesta.puntuacion) {
      handleCalificar(v);
    }
  };

  

  const getColorSituacion = (situacion: string) => {
    const situacionLower = situacion.toLowerCase();
    if (situacionLower.includes('resuel') || situacionLower.includes('finaliz')) {
      return '$green10';
    }
    if (situacionLower.includes('proceso') || situacionLower.includes('revision')) {
      return '$orange10';
    }
    if (situacionLower.includes('rechaz') || situacionLower.includes('cancel')) {
      return '$red10';
    }
    return '$blue10';
  };

  return (
    <Card
      elevate
      size="$4"
      bordered
      animation="bouncy"
      scale={0.9}
      hoverStyle={{ scale: 0.925 }}
      pressStyle={{ scale: 0.875 }}
      marginBottom="$3"
      backgroundColor="$background"
      borderColor="$borderColor"
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={4}
      onPress={() => onPress?.(respuesta)}
    >
      <Card.Header paddingBottom="$2">
        {/* Header con información del funcionario */}
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack flex={1}>
            <XStack alignItems="center" space="$2">
              <Ionicons name="person" size={16} color="#666" />
              <Text fontSize="$3" fontWeight="600" color="$color">
                {respuesta.funcionarioNombre}
              </Text>
            </XStack>
            <Text fontSize="$2" color="$color11">
              {respuesta.publicacion.departamento}
            </Text>
          </YStack>
          
          <YStack alignItems="flex-end">
            <Text fontSize="$2" color="$color11">
              {formatearFecha(respuesta.fechaRespuesta)}
            </Text>
            {respuesta.evidencias.length > 0 && (
              <XStack alignItems="center" space="$1" marginTop="$1">
                <Ionicons name="attach" size={12} color="#666" />
                <Text fontSize="$1" color="$color11">
                  {respuesta.evidencias.length} evidencia{respuesta.evidencias.length !== 1 ? 's' : ''}
                </Text>
              </XStack>
            )}
          </YStack>
        </XStack>

        {/* Información de la publicación */}
        {mostrarPublicacion && (
          <YStack marginTop="$2" padding="$2" backgroundColor="$gray2" borderRadius="$2">
            <Text fontSize="$2" fontWeight="500" color="$color12">
              {respuesta.publicacion.codigo} - {respuesta.publicacion.titulo}
            </Text>
            <Text fontSize="$1" color="$color11">
              {respuesta.publicacion.categoria}
            </Text>
          </YStack>
        )}
      </Card.Header>

      <YStack padding="$3" paddingTop="$2" space="$3">
        {/* Descripción de la respuesta */}
        {!compacto && (
          <YStack space="$2">
            <Text fontSize="$3" fontWeight="500" color="$color12">
              Respuesta Municipal:
            </Text>
            <Text fontSize="$3" color="$color" numberOfLines={compacto ? 2 : undefined}>
              {respuesta.descripcion}
            </Text>
          </YStack>
        )}

        {/* Acciones tomadas */}
        {respuesta.acciones && !compacto && (
          <YStack space="$2">
            <Text fontSize="$3" fontWeight="500" color="$color12">
              Acciones Realizadas:
            </Text>
            <Text fontSize="$3" color="$color">
              {respuesta.acciones}
            </Text>
          </YStack>
        )}

        {/* Cambio de situación */}
        <YStack space="$2">
          <Text fontSize="$3" fontWeight="500" color="$color12">
            Estado de la Solicitud:
          </Text>
          <XStack alignItems="center" space="$2" flexWrap="wrap">
            <XStack alignItems="center" space="$2">
              <Text fontSize="$2" color="$color11">Anterior:</Text>
              <Text 
                fontSize="$2" 
                color="$color11" 
                backgroundColor="$gray4" 
                paddingHorizontal="$2" 
                paddingVertical="$1" 
                borderRadius="$2"
              >
                {respuesta.situacionAnterior}
              </Text>
            </XStack>
            
            <Ionicons name="arrow-forward" size={16} color="#666" />
            
            <XStack alignItems="center" space="$2">
              <Text fontSize="$2" color="$color11">Actual:</Text>
              <Text 
                fontSize="$2" 
                color="white" 
                backgroundColor={getColorSituacion(respuesta.situacionNueva)}
                paddingHorizontal="$2" 
                paddingVertical="$1" 
                borderRadius="$2"
                fontWeight="500"
              >
                {respuesta.situacionNueva}
              </Text>
            </XStack>
          </XStack>
        </YStack>

        {/* Calificación */}
        <YStack space="$2">
          <Text fontSize="$3" fontWeight="500" color="$color12">
            {respuesta.puntuacion ? 'Tu Calificación:' : 'Califica esta Respuesta:'}
          </Text>
          
          <XStack space="$1" alignItems="center">
            <EmojiRating
              value={respuesta.puntuacion ?? null}
              onChange={handleEmojiChange}
              disabled={calificando || !!respuesta.puntuacion}
              size={22}
              showLabel={!!respuesta.puntuacion}
            />
            {calificando && (
              <Text fontSize="$2" color="$color11">Enviando…</Text>
            )}
          </XStack>
          
          {!respuesta.puntuacion && (
            <Text fontSize="$1" color="$color10">
              Toca las estrellas para calificar esta respuesta
            </Text>
          )}
        </YStack>
      </YStack>

      {/* Footer con botón de acción si es necesario */}
      {onPress && (
        <Card.Footer paddingTop="$2">
          <Button
            flex={1}
            size="$3"
            variant="outlined"
            backgroundColor="transparent"
            borderColor="$borderColor"
            onPress={() => onPress(respuesta)}
          >
            <XStack alignItems="center" space="$2">
              <Ionicons name="eye" size={16} color="#666" />
              <Text color="$color">Ver Detalles</Text>
            </XStack>
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
};
