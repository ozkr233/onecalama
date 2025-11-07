// src/components/ui/AnuncioCard.tsx
import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView } from 'react-native';
import { Card, Text, XStack, YStack, Button, Image, styled } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { AnuncioMunicipal } from '../../types/denuncias';
import { Badge } from './Badge';

// ---------- Estilos auxiliares ----------
const ImageContainer = styled(YStack, {
  borderRadius: '$3',
  overflow: 'hidden',
  backgroundColor: '#f5f5f5',
});

interface AnuncioCardProps {
  anuncio: AnuncioMunicipal;
  isOffline?: boolean;
}

// ---------- Utilidades ----------
const getEstadoVariant = (estado: string) => {
  const s = (estado || '').toLowerCase();
  if (s.includes('activo')) return 'success';
  if (s.includes('programado')) return 'info';
  if (s.includes('finalizado')) return 'default';
  return 'warning';
};

const formatearFecha = (fecha: string): string => {
  try {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return fecha;
  }
};

/**
 * Construye una URL válida de Cloudinary.
 * Acepta URL completa o public_id/ruta relativa.
 * Inserta /image/upload/ y transformaciones f_auto,q_auto,w_,h_,c_limit.
 */
const getCloudinaryUrl = (src: string, width?: number, height?: number): string => {
  if (!src) return '';
  const cloudName = 'de06451wd';
  const base = `https://res.cloudinary.com/${cloudName}/image/upload/`;

  const t: string[] = ['f_auto', 'q_auto'];
  if (width) t.push(`w_${Math.floor(width)}`);
  if (height) t.push(`h_${Math.floor(height)}`, 'c_limit');

  // URL completa → normalizar
  if (src.startsWith('http://') || src.startsWith('https://')) {
    try {
      const u = new URL(src);
      // asegura /image/upload/
      if (!u.pathname.includes('/image/upload/')) {
        u.pathname = u.pathname.replace(/^\/?/, '/image/upload/');
      }
      // inserta/actualiza transformaciones
      u.pathname = u.pathname.replace('/image/upload/', `/image/upload/${t.join(',')}/`);
      return u.toString();
    } catch {
      // si no parsea, se continua tratándolo como public_id
    }
  }

  // public_id o ruta relativa
  let publicId = src.replace(/^\/+/, '');
  publicId = publicId.replace(/^image\/upload\/?/, ''); // quita duplicado si viene incluido
  const encodedId = publicId.split('/').map(encodeURIComponent).join('/');

  return `${base}${t.join(',')}/${encodedId}`;
};

// ---------- Placeholder local ----------
const getPlaceholderImage = (titulo: string) => {
  const t = (titulo || '').toLowerCase();
  // usa el mismo icono para todos
  const icon = require('../../../assets/images/icon.png');
  if (t.includes('agua')) return icon;
  if (t.includes('obras') || t.includes('construccion')) return icon;
  if (t.includes('limpieza') || t.includes('aseo')) return icon;
  if (t.includes('salud') || t.includes('vacunacion')) return icon;
  return icon;
};

// ==============================================================
export default function AnuncioCard({ anuncio, isOffline = false }: AnuncioCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [imageErrors, setImageErrors] = useState<string[]>([]);

  // Ancho disponible para las imágenes dentro del card
  const screenWidth = Dimensions.get('window').width;
  // Card tiene padding horizontal ~$4 (≈16) * 2 → restamos 32
  const cardInnerWidth = useMemo(() => Math.max(screenWidth - 32 * 2, 240), [screenWidth]);

  const isTextLong = (anuncio.descripcion || '').length > 150;
  const displayText = expanded
    ? anuncio.descripcion
    : isTextLong
      ? `${anuncio.descripcion.substring(0, 150)}...`
      : anuncio.descripcion;

  const handleImageError = (id: string) => setImageErrors(prev => [...prev, id]);

  // ===================== Sección de Imágenes =====================
  const ImagenesSection = () => {
    const hasCloudinaryImages = !!(anuncio.imagenes && anuncio.imagenes.length > 0);

    // --- Sin imágenes de servidor: placeholder local ---
    if (!hasCloudinaryImages) {
      const ph = getPlaceholderImage(anuncio.titulo);
      return (
        <YStack gap="$2">
          <XStack ai="center" gap="$2">
            <Text fontSize="$3" fontWeight="500" color="$textSecondary">📸 Imagen temática</Text>
            <Badge variant="info" size="sm"><Text fontSize="$1" color="white">LOCAL</Text></Badge>
          </XStack>

          <ImageContainer>
            <Image
              source={ph}
              style={{ width: '100%', height: 180 }}
              resizeMode="contain"
            />
          </ImageContainer>

          <Text fontSize="$2" color="$textSecondary" fontStyle="italic">
            Imagen representativa del anuncio
          </Text>
        </YStack>
      );
    }

    // --- Una imagen principal ---
    if (anuncio.imagenes!.length === 1) {
      const img = anuncio.imagenes![0] as any; // { id, imagen }
      const idStr = String(img.id ?? img.imagen);
      const hasError = imageErrors.includes(idStr);
      const mainUrl = getCloudinaryUrl(img.imagen, Math.floor(cardInnerWidth), 220);

      return (
        <YStack gap="$2">
          <XStack ai="center" gap="$2">
            <Text fontSize="$3" fontWeight="500" color="$textSecondary">📸 Imagen adjunta</Text>
            <Badge variant="success" size="sm"><Text fontSize="$1" color="white">SERVIDOR</Text></Badge>
          </XStack>

          {!hasError ? (
            <ImageContainer>
              <Image
                source={{ uri: mainUrl }}
                style={{ width: '100%', height: 220 }}
                resizeMode="cover"
                onError={() => handleImageError(idStr)}
              />
            </ImageContainer>
          ) : (
            <YStack gap="$2">
              <ImageContainer>
                <Image
                  source={getPlaceholderImage(anuncio.titulo)}
                  style={{ width: '100%', height: 180 }}
                  resizeMode="contain"
                />
              </ImageContainer>
              <XStack ai="center" gap="$2" p="$2" bg="$orange2" br="$2">
                <Ionicons name="warning-outline" size={16} color="#F59E0B" />
                <Text fontSize="$2" color="$orange9">
                  Error cargando imagen del servidor, usando placeholder
                </Text>
              </XStack>
            </YStack>
          )}
        </YStack>
      );
    }

    // --- Galería de múltiples imágenes ---
    return (
      <YStack gap="$2">
        <XStack ai="center" gap="$2">
          <Text fontSize="$3" fontWeight="500" color="$textSecondary">
            📸 {anuncio.imagenes!.length} imágenes
          </Text>
          <Badge variant="success" size="sm"><Text fontSize="$1" color="white">SERVIDOR</Text></Badge>
        </XStack>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }}>
          <XStack gap="$2" paddingHorizontal="$4">
            {anuncio.imagenes!.map((img: any, index: number) => {
              const idStr = String(img.id ?? `${index}`);
              const hasError = imageErrors.includes(idStr);
              const thumbUrl = getCloudinaryUrl(img.imagen, 140, 110);

              return (
                <YStack key={idStr} gap="$1" ai="center">
                  <ImageContainer>
                    <Image
                      source={hasError ? getPlaceholderImage(anuncio.titulo) : { uri: thumbUrl }}
                      style={{ width: 140, height: 110 }}
                      resizeMode="cover"
                      onError={() => handleImageError(idStr)}
                    />
                  </ImageContainer>
                  <Text fontSize="$1" color="$textSecondary">
                    {hasError ? 'Error' : `${index + 1}/${anuncio.imagenes!.length}`}
                  </Text>
                </YStack>
              );
            })}
          </XStack>
        </ScrollView>
      </YStack>
    );
  };

  // ===================== Render principal =====================
  return (
    <Card
      bg="white"
      p="$4"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.08}
      shadowRadius={6}
      elevation={2}
      mb="$3"
    >
      <YStack gap="$3">
        {/* Header */}
        <XStack ai="flex-start" jc="space-between" gap="$3">
          <YStack flex={1} gap="$2">
            <Text fontSize="$5" fontWeight="bold" color="$textPrimary" lineHeight="$5">
              {anuncio.titulo}
            </Text>
            {!!anuncio.subtitulo && (
              <Text fontSize="$4" color="$textSecondary" fontWeight="500">
                {anuncio.subtitulo}
              </Text>
            )}
          </YStack>

          <YStack gap="$2" ai="flex-end">
            <Badge variant={getEstadoVariant(anuncio.estado)} size="sm">
              {anuncio.estado}
            </Badge>
            {isOffline && (
              <Badge variant="warning" size="sm">
                <XStack ai="center" gap="$1">
                  <Ionicons name="wifi-outline" size={10} color="white" />
                  <Text fontSize="$1" color="white">OFFLINE</Text>
                </XStack>
              </Badge>
            )}
          </YStack>
        </XStack>

        {/* Imágenes */}
        <ImagenesSection />

        {/* Descripción */}
        <YStack gap="$2">
          <Text fontSize="$4" color="$textPrimary" lineHeight="$4">
            {displayText}
          </Text>

          {isTextLong && (
            <Button
              size="$2"
              variant="outlined"
              color="$primary"
              alignSelf="flex-start"
              onPress={() => setExpanded(v => !v)}
              paddingHorizontal="$0"
            >
              <XStack ai="center" gap="$1">
                <Text fontSize="$3" color="$primary" fontWeight="500">
                  {expanded ? 'Ver menos' : 'Ver más'}
                </Text>
                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color="#E67E22"
                />
              </XStack>
            </Button>
          )}
        </YStack>

        {/* Footer */}
        <XStack ai="center" jc="space-between" pt="$2" borderTopWidth={1} borderColor="$borderColor">
          <XStack ai="center" gap="$2" flex={1}>
            <Ionicons name="pricetag-outline" size={16} color="#009688" />
            <Text fontSize="$3" color="$textSecondary" flex={1} numberOfLines={1}>
              {anuncio.categoria?.nombre || 'Sin categoría'}
            </Text>
          </XStack>

          <XStack ai="center" gap="$2">
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text fontSize="$3" color="$textSecondary">{formatearFecha(anuncio.fecha)}</Text>
          </XStack>
        </XStack>

        {/* Aviso offline */}
        {isOffline && (
          <XStack ai="center" gap="$2" pt="$2" borderTopWidth={1} borderColor="$orange2">
            <Ionicons name="information-circle-outline" size={14} color="#F59E0B" />
            <Text fontSize="$2" color="$orange9">
              Información guardada localmente - puede no estar actualizada
            </Text>
          </XStack>
        )}
      </YStack>
    </Card>
  );
}
