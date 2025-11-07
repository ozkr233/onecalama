// src/components/forms/EvidenceSection.tsx
import React, { useState } from 'react';
import { Alert, Image, ScrollView } from 'react-native';
import { Text, YStack, XStack, Button, Card, H4 } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
// Usamos únicamente ImagePicker para permisos de galería/cámara

interface Evidence {
  id: string;
  uri: string;
  type: 'image' | 'video';
  fileName: string;
  fileSize?: number;
}

interface EvidenceSectionProps {
  evidences: Evidence[];
  onEvidencesChange: (evidences: Evidence[]) => void;
  maxImages?: number;
}

const EvidenceSection: React.FC<EvidenceSectionProps> = ({
  evidences,
  onEvidencesChange,
  maxImages = 5
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Solicitar permisos
  const requestPermissions = async () => {
    const cameraResult = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraResult.status !== 'granted' || mediaLibraryResult.status !== 'granted') {
      Alert.alert(
        '⚠️ Permisos necesarios',
        'Necesitamos permisos de cámara y galería para agregar evidencias a tu denuncia.',
        [{ text: 'Entendido' }]
      );
      return false;
    }
    return true;
  };

  // Abrir cámara
  const openCamera = async () => {
    if (evidences.length >= maxImages) {
      Alert.alert('Límite alcanzado', `Solo puedes agregar hasta ${maxImages} evidencias`);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newEvidence: Evidence = {
          id: Date.now().toString(),
          uri: asset.uri,
          type: 'image',
          fileName: asset.fileName || `imagen_${Date.now()}.jpg`,
          fileSize: asset.fileSize
        };

        onEvidencesChange([...evidences, newEvidence]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir la cámara');
      console.error('Error al abrir cámara:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir galería
  const openGallery = async () => {
    if (evidences.length >= maxImages) {
      Alert.alert('Límite alcanzado', `Solo puedes agregar hasta ${maxImages} evidencias`);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: maxImages - evidences.length,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const newEvidences: Evidence[] = result.assets.map((asset, index) => ({
          id: `${Date.now()}_${index}`,
          uri: asset.uri,
          type: 'image',
          fileName: asset.fileName || `imagen_${Date.now()}_${index}.jpg`,
          fileSize: asset.fileSize
        }));

        onEvidencesChange([...evidences, ...newEvidences]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir la galería');
      console.error('Error al abrir galería:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar evidencia
  const removeEvidence = (evidenceId: string) => {
    Alert.alert(
      '🗑️ Eliminar evidencia',
      '¿Estás seguro de que deseas eliminar esta evidencia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const filteredEvidences = evidences.filter(e => e.id !== evidenceId);
            onEvidencesChange(filteredEvidences);
          }
        }
      ]
    );
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    const mb = kb / 1024;

    if (mb >= 1) {
      return `${mb.toFixed(1)} MB`;
    } else {
      return `${kb.toFixed(0)} KB`;
    }
  };

  return (
    <Card elevate p="$4" gap="$4">
      <XStack jc="space-between" ai="center">
        <H4 color="$textPrimary">📷 Evidencias</H4>
        <Text fontSize="$3" color="$textSecondary">
          {evidences.length}/{maxImages}
        </Text>
      </XStack>

      <Text fontSize="$4" color="$textSecondary" lineHeight="$1">
        Las fotos ayudan a procesar tu denuncia más rápidamente. Puedes agregar hasta {maxImages} imágenes.
      </Text>

      {/* Botones de acción */}
      <XStack gap="$3">
        <Button
          f={1}
          size="$4"
          bg="white"
          borderColor="$primary"
          borderWidth={2}
          color="$primary"
          onPress={openCamera}
          disabled={isLoading || evidences.length >= maxImages}
          pressStyle={{
            scale: 0.98,
            bg: '$primary',
          }}
          style={{
            shadowColor: '#E67E22',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
            opacity: evidences.length >= maxImages ? 0.5 : 1
          }}
        >
          <Ionicons
            name={isLoading ? "hourglass" : "camera"}
            size={18}
            color="#E67E22"
          />
          <Text color="$primary" ml="$2" fontWeight="bold">
            {isLoading ? 'Abriendo...' : 'Cámara'}
          </Text>
        </Button>

        <Button
          f={1}
          size="$4"
          bg="white"
          borderColor="$secondary"
          borderWidth={2}
          color="$secondary"
          onPress={openGallery}
          disabled={isLoading || evidences.length >= maxImages}
          pressStyle={{
            scale: 0.98,
            bg: '$secondary',
          }}
          style={{
            shadowColor: '#009688',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
            opacity: evidences.length >= maxImages ? 0.5 : 1
          }}
        >
          <Ionicons
            name={isLoading ? "hourglass" : "images"}
            size={18}
            color="#009688"
          />
          <Text color="$secondary" ml="$2" fontWeight="bold">
            {isLoading ? 'Abriendo...' : 'Galería'}
          </Text>
        </Button>
      </XStack>

      {/* Vista previa de evidencias */}
      {evidences.length > 0 && (
        <YStack gap="$3">
          <Text fontSize="$4" fontWeight="bold" color="$textPrimary">
            📁 Evidencias agregadas ({evidences.length})
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$3" p="$1">
              {evidences.map((evidence) => (
                <Card
                  key={evidence.id}
                  elevate
                  p="$2"
                  gap="$2"
                  bg="white"
                  borderRadius="$4"
                  width={120}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  {/* Imagen */}
                  <YStack position="relative">
                    <Image
                      source={{ uri: evidence.uri }}
                      style={{
                        width: 104,
                        height: 80,
                        borderRadius: 8,
                        backgroundColor: '#f5f5f5'
                      }}
                      resizeMode="cover"
                    />

                    {/* Botón eliminar */}
                    <Button
                      size="$2"
                      circular
                      bg="$red9"
                      position="absolute"
                      top={4}
                      right={4}
                      onPress={() => removeEvidence(evidence.id)}
                      pressStyle={{ scale: 0.9 }}
                      style={{
                        shadowColor: '#f44336',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                        elevation: 2,
                      }}
                    >
                      <Ionicons name="close" size={12} color="white" />
                    </Button>
                  </YStack>

                  {/* Información del archivo */}
                  <YStack gap="$1">
                    <Text
                      fontSize="$2"
                      color="$textPrimary"
                      fontWeight="600"
                      numberOfLines={1}
                    >
                      {evidence.fileName}
                    </Text>
                    {evidence.fileSize && (
                      <Text fontSize="$1" color="$textSecondary">
                        {formatFileSize(evidence.fileSize)}
                      </Text>
                    )}
                  </YStack>
                </Card>
              ))}
            </XStack>
          </ScrollView>
        </YStack>
      )}

      {/* Estado cuando no hay evidencias */}
      {evidences.length === 0 && (
        <YStack ai="center" gap="$2" p="$4" bg="$gray2" borderRadius="$4">
          <Ionicons name="images-outline" size={40} color="#999" />
          <Text fontSize="$3" color="$textSecondary" textAlign="center">
            No hay evidencias agregadas
          </Text>
          <Text fontSize="$2" color="$textSecondary" textAlign="center">
            Toca los botones de arriba para agregar fotos
          </Text>
        </YStack>
      )}

      {/* Consejos */}
      <YStack gap="$1" p="$3" bg="$blue2" borderRadius="$3">
        <Text fontSize="$3" color="$blue11" fontWeight="600">
          💡 Consejos para mejores evidencias:
        </Text>
        <Text fontSize="$2" color="$blue10">
          • Toma fotos claras y bien iluminadas
        </Text>
        <Text fontSize="$2" color="$blue10">
          • Incluye el problema completo en la imagen
        </Text>
        <Text fontSize="$2" color="$blue10">
          • Si es posible, toma desde diferentes ángulos
        </Text>
      </YStack>
    </Card>
  );
};

export default EvidenceSection;
