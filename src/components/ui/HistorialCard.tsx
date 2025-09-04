// src/components/ui/HistorialCard.tsx - DESDE CERO
import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { YStack, XStack, Text, H6 } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { HistorialDenuncia } from '../../types/historial';
import { formatearFecha, getEstadoColor, getEstadoTexto } from '../../utils/formatters';

interface Props {
  item: HistorialDenuncia;
  onPress: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function HistorialCard({ item, onPress, isFirst, isLast }: Props) {
  
  // Calcular datos de respuestas
  const totalRespuestas = item.respuestas?.length || 0;
  const respuestasNoLeidas = item.respuestas?.filter(r => !r.leida).length || 0;
  const ultimaRespuesta = item.respuestas?.length ? 
    item.respuestas[item.respuestas.length - 1] : null;

  // Obtener primera imagen de evidencias
  const primeraImagen = item.evidencias?.find(e => e.tipo === 'imagen' && e.url);
  
  // Obtener colores del estado
  const estadoColors = getEstadoColor(item.estado);

  // Calcular tiempo transcurrido
  const calcularTiempoTranscurrido = (fecha: string): string => {
    try {
      const fechaCreacion = new Date(fecha);
      const ahora = new Date();
      const diferencia = ahora.getTime() - fechaCreacion.getTime();
      const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
      
      if (dias === 0) return 'Hoy';
      if (dias === 1) return 'Ayer';
      if (dias < 7) return `Hace ${dias} días`;
      if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
      return formatearFecha(fecha);
    } catch {
      return formatearFecha(fecha);
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
        start={[0, 0]}
        end={[1, 1]}
        style={{
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.05)',
          ...(isFirst && { marginTop: 8 }),
          ...(isLast && { marginBottom: 24 }),
        }}
      >
        <YStack space="$3">
          
          {/* Header: Título y Estado */}
          <XStack justifyContent="space-between" alignItems="flex-start" space="$3">
            <YStack flex={1} space="$1">
              <H6 
                fontSize="$4" 
                fontWeight="700" 
                color="$gray12"
                numberOfLines={2}
                lineHeight={20}
              >
                {item.titulo || 'Sin título'}
              </H6>
              
              <XStack alignItems="center" space="$2">
                <Text fontSize="$2" color="$gray10" fontWeight="600">
                  {item.numeroFolio || `#${item.id}`}
                </Text>
                <Text fontSize="$2" color="$gray8">•</Text>
                <Text fontSize="$2" color="$gray10">
                  {item.categoria || 'Sin categoría'}
                </Text>
              </XStack>
            </YStack>

            {/* Badge de estado */}
            <YStack
              backgroundColor={estadoColors.main}
              paddingHorizontal="$3"
              paddingVertical="$1.5"
              borderRadius="$6"
              borderWidth={1}
              borderColor={estadoColors.border}
              alignItems="center"
              minWidth={80}
            >
              <Text 
                fontSize="$1" 
                color="white" 
                fontWeight="800"
                textTransform="uppercase"
                letterSpacing={0.5}
              >
                {getEstadoTexto(item.estado)}
              </Text>
            </YStack>
          </XStack>

          {/* Descripción */}
          <Text 
            fontSize="$3" 
            color="$gray11" 
            numberOfLines={2}
            lineHeight={18}
          >
            {item.descripcion || 'Sin descripción'}
          </Text>

          {/* Preview de imagen si existe */}
          {primeraImagen && (
            <YStack>
              <Image
                source={{ uri: primeraImagen.url }}
                style={{
                  width: '100%',
                  height: 120,
                  borderRadius: 8,
                  backgroundColor: '#f3f4f6'
                }}
                resizeMode="cover"
              />
              {item.evidencias!.length > 1 && (
                <XStack
                  position="absolute"
                  top="$2"
                  right="$2"
                  backgroundColor="rgba(0, 0, 0, 0.7)"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$3"
                  alignItems="center"
                  space="$1"
                >
                  <Ionicons name="images" size={12} color="white" />
                  <Text fontSize="$1" color="white" fontWeight="600">
                    +{item.evidencias!.length - 1}
                  </Text>
                </XStack>
              )}
            </YStack>
          )}

          {/* Ubicación si existe */}
          {item.ubicacion?.direccion && (
            <XStack alignItems="center" space="$2">
              <Ionicons name="location-outline" size={14} color="#64748b" />
              <Text 
                fontSize="$2" 
                color="$gray10" 
                numberOfLines={1}
                flex={1}
              >
                {item.ubicacion.direccion}
              </Text>
            </XStack>
          )}

          {/* Footer con metadata */}
          <YStack space="$2">
            
            {/* Tiempo, departamento y prioridad */}
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" space="$2">
                <Ionicons name="time-outline" size={14} color="#64748b" />
                <Text fontSize="$2" color="$gray10">
                  {calcularTiempoTranscurrido(item.fechaCreacion)}
                </Text>
              </XStack>

              {/* Prioridad */}
              <XStack alignItems="center" space="$1.5">
                <Ionicons 
                  name={item.prioridad === 'sin_priorizar' ? 'ellipse-outline' : 'flag-outline'} 
                  size={14} 
                  color={item.prioridad === 'sin_priorizar' ? '#9CA3AF' : '#64748b'} 
                />
                <Text 
                  fontSize="$2" 
                  color={item.prioridad === 'sin_priorizar' ? '$gray8' : '$gray10'}
                  fontStyle={item.prioridad === 'sin_priorizar' ? 'italic' : 'normal'}
                >
                  {item.prioridad === 'sin_priorizar' ? 'Sin priorizar' : 
                   item.prioridad === 'alta' ? 'Alta' :
                   item.prioridad === 'media' ? 'Media' : 'Baja'}
                </Text>
              </XStack>

              {item.departamentoAsignado && (
                <XStack alignItems="center" space="$2">
                  <Ionicons name="business-outline" size={14} color="#64748b" />
                  <Text fontSize="$2" color="$gray10" numberOfLines={1}>
                    {item.departamentoAsignado}
                  </Text>
                </XStack>
              )}
            </XStack>

            {/* Respuestas y tiempo de respuesta */}
            {(totalRespuestas > 0 || item.tiempoRespuesta !== null) && (
              <XStack justifyContent="space-between" alignItems="center">
                
                {/* Indicador de respuestas */}
                {totalRespuestas > 0 && (
                  <XStack
                    backgroundColor={respuestasNoLeidas > 0 ? "$red2" : "$blue2"}
                    paddingHorizontal="$2.5"
                    paddingVertical="$1.5"
                    borderRadius="$4"
                    borderWidth={1}
                    borderColor={respuestasNoLeidas > 0 ? "$red6" : "$blue6"}
                    alignItems="center"
                    space="$1.5"
                  >
                    <Ionicons
                      name={respuestasNoLeidas > 0 ? "mail" : "mail-open-outline"}
                      size={14}
                      color={respuestasNoLeidas > 0 ? "#dc2626" : "#2563eb"}
                    />
                    <Text
                      fontSize="$2"
                      color={respuestasNoLeidas > 0 ? "$red11" : "$blue11"}
                      fontWeight="600"
                    >
                      {totalRespuestas} respuesta{totalRespuestas !== 1 ? 's' : ''}
                    </Text>
                    {respuestasNoLeidas > 0 && (
                      <>
                        <Text fontSize="$2" color="$red9">•</Text>
                        <Text fontSize="$2" color="$red11" fontWeight="700">
                          {respuestasNoLeidas} nueva{respuestasNoLeidas !== 1 ? 's' : ''}
                        </Text>
                      </>
                    )}
                  </XStack>
                )}

                {/* Tiempo de respuesta */}
                {item.tiempoRespuesta !== null && item.tiempoRespuesta !== undefined && (
                  <XStack alignItems="center" space="$1.5">
                    <Ionicons name="timer-outline" size={14} color="#64748b" />
                    <Text fontSize="$2" color="$gray10">
                      {item.tiempoRespuesta} día{item.tiempoRespuesta !== 1 ? 's' : ''}
                    </Text>
                  </XStack>
                )}
              </XStack>
            )}

            {/* Preview de última respuesta si existe */}
            {ultimaRespuesta && (
              <YStack
                backgroundColor="$blue1"
                padding="$2.5"
                borderRadius="$3"
                borderLeftWidth={3}
                borderLeftColor="$blue8"
              >
                <XStack justifyContent="space-between" alignItems="center" marginBottom="$1">
                  <XStack alignItems="center" space="$1.5">
                    <Ionicons name="chatbubble-outline" size={12} color="#2563eb" />
                    <Text fontSize="$1" color="$blue11" fontWeight="600">
                      {ultimaRespuesta.autor || 'Municipalidad'}
                    </Text>
                  </XStack>
                  <Text fontSize="$1" color="$blue10">
                    {calcularTiempoTranscurrido(ultimaRespuesta.fechaRespuesta)}
                  </Text>
                </XStack>
                
                <Text 
                  fontSize="$2" 
                  color="$blue12" 
                  numberOfLines={2}
                  lineHeight={16}
                >
                  {ultimaRespuesta.mensaje || 'Sin mensaje'}
                </Text>
              </YStack>
            )}

            {/* Calificación de satisfacción si existe */}
            {item.satisfaccionCiudadano && (
              <XStack justifyContent="center" alignItems="center" space="$1">
                <Text fontSize="$2" color="$gray10">Tu calificación:</Text>
                <XStack space="$0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star"
                      size={12}
                      color={star <= item.satisfaccionCiudadano! ? "#f59e0b" : "#d1d5db"}
                    />
                  ))}
                </XStack>
                <Text fontSize="$2" color="$amber10" fontWeight="600">
                  {item.satisfaccionCiudadano}/5
                </Text>
              </XStack>
            )}
          </YStack>
        </YStack>
      </LinearGradient>
    </TouchableOpacity>
  );
}