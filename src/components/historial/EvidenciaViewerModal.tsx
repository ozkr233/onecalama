// src/components/historial/EvidenciaViewerModal.tsx
import React, { useState } from 'react';
import { Modal, Dimensions, Alert, Share } from 'react-native';
import { Text, YStack, XStack, Button, Card, Image, ScrollView } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Evidencia } from '../../types/historial';
import { formatearFecha } from '../../utils/formatters';

interface EvidenciaViewerModalProps {
  visible: boolean;
  evidencia: Evidencia | null;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export const EvidenciaViewerModal: React.FC<EvidenciaViewerModalProps> = ({
  visible,
  evidencia,
  onClose
}) => {
  const [imageError, setImageError] = useState(false);

  if (!evidencia) return null;

  const handleDescargar = () => {
    // TODO: Implementar descarga real
    Alert.alert(
      'Descargar archivo',
      `¿Deseas descargar "${evidencia.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Descargar',
          onPress: () => {
            console.log('Descargando evidencia:', evidencia.url);
            Alert.alert('Éxito', 'La descarga comenzará en breve');
          }
        }
      ]
    );
  };

  const handleCompartir = async () => {
    try {
      await Share.share({
        message: `Evidencia: ${evidencia.nombre}`,
        url: evidencia.url,
        title: evidencia.nombre
      });
    } catch (error) {
      console.error('Error compartiendo:', error);
      Alert.alert('Error', 'No se pudo compartir el archivo');
    }
  };

  const getIconForType = (tipo: string) => {
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Header */}
        <Card bg="rgba(0,0,0,0.9)" p="$3" position="absolute" top={0} left={0} right={0} zIndex={10}>
          <XStack justifyContent="space-between" alignItems="center">
            <Button
              size="$3"
              circular
              bg="rgba(255,255,255,0.2)"
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color="white" />
            </Button>

            <Text fontSize="$4" fontWeight="bold" color="white" textAlign="center" flex={1} mx="$3">
              {evidencia.nombre}
            </Text>

            <XStack gap="$2">
              <Button
                size="$3"
                circular
                bg="rgba(255,255,255,0.2)"
                onPress={handleCompartir}
              >
                <Ionicons name="share" size={20} color="white" />
              </Button>
              <Button
                size="$3"
                circular
                bg="rgba(255,255,255,0.2)"
                onPress={handleDescargar}
              >
                <Ionicons name="download" size={20} color="white" />
              </Button>
            </XStack>
          </XStack>
        </Card>

        {/* Contenido principal */}
        <YStack flex={1} justifyContent="center" alignItems="center" p="$4" pt="$16">
          {evidencia.tipo === 'imagen' && !imageError ? (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
              maximumZoomScale={3}
              minimumZoomScale={1}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              <Image
                source={{ uri: evidencia.url }}
                width={width - 32}
                height={height * 0.7}
                resizeMode="contain"
                onError={() => setImageError(true)}
              />
            </ScrollView>
          ) : (
            // Vista para documentos, videos o imágenes con error
            <YStack alignItems="center" gap="$4" bg="rgba(255,255,255,0.1)" p="$6" br="$4">
              <Card bg="rgba(255,255,255,0.2)" p="$4" br="$4">
                <Ionicons
                  name={getIconForType(evidencia.tipo)}
                  size={64}
                  color="white"
                />
              </Card>

              <YStack alignItems="center" gap="$2">
                <Text fontSize="$5" fontWeight="bold" color="white" textAlign="center">
                  {evidencia.nombre}
                </Text>
                <Text fontSize="$3" color="rgba(255,255,255,0.8)" textAlign="center">
                  {evidencia.tipo.charAt(0).toUpperCase() + evidencia.tipo.slice(1)}
                  {evidencia.size && ` • ${formatFileSize(evidencia.size)}`}
                </Text>
              </YStack>

              {evidencia.tipo === 'video' && (
                <Button
                  size="$4"
                  bg="$primary"
                  color="white"
                  fontWeight="bold"
                  onPress={() => {
                    Alert.alert(
                      'Reproducir video',
                      'Esta funcionalidad estará disponible próximamente'
                    );
                  }}
                >
                  <Ionicons name="play" size={20} color="white" />
                  <Text color="white" ml="$2">
                    Reproducir video
                  </Text>
                </Button>
              )}

              {evidencia.tipo === 'documento' && (
                <Button
                  size="$4"
                  bg="$secondary"
                  color="white"
                  fontWeight="bold"
                  onPress={() => {
                    Alert.alert(
                      'Abrir documento',
                      'Esta funcionalidad estará disponible próximamente'
                    );
                  }}
                >
                  <Ionicons name="open" size={20} color="white" />
                  <Text color="white" ml="$2">
                    Abrir documento
                  </Text>
                </Button>
              )}
            </YStack>
          )}
        </YStack>

        {/* Footer con información */}
        <Card bg="rgba(0,0,0,0.9)" p="$4" position="absolute" bottom={0} left={0} right={0}>
          <YStack gap="$2">
            {evidencia.descripcion && (
              <Text fontSize="$3" color="white" textAlign="center">
                {evidencia.descripcion}
              </Text>
            )}
            <XStack justifyContent="center" gap="$4">
              <Text fontSize="$2" color="rgba(255,255,255,0.7)">
                📅 {formatearFecha(evidencia.fechaSubida)}
              </Text>
              {evidencia.mimeType && (
                <Text fontSize="$2" color="rgba(255,255,255,0.7)">
                  📄 {evidencia.mimeType}
                </Text>
              )}
            </XStack>
          </YStack>
        </Card>
      </SafeAreaView>
    </Modal>
  );
};