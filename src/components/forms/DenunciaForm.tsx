// src/components/forms/DenunciaForm.tsx - REFACTORIZADO CON EVIDENCIAS
import React, { useState, useEffect } from 'react';
import { Modal, ScrollView } from 'react-native';
import { Text, YStack, XStack, Button, Card, H4 } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { DenunciaFormData, LocationData } from '../../types';

import BasicInfoSection from './BasicInfoSection';
import AIAssistantSection from './AIAssistantSection';
import FormProgressCard from './FormProgressCard';
import SubmitButton from './SubmitButton';
import EvidenceSection from './EvidenceSection';

import Selector from './Selector';
import MapSelector from './MapSelector';
import UbicacionSection from './UbicacionSection';

interface DenunciaFormProps {
  formData: DenunciaFormData;
  onFormDataChange: (data: DenunciaFormData) => void;
  onSubmit: () => void;
  loading?: boolean;
  categorias: any[];
  departamentos: any[];
}

const DenunciaForm: React.FC<DenunciaFormProps> = ({
  formData,
  onFormDataChange,
  onSubmit,
  loading = false,
  categorias,
  departamentos
}) => {
  // Estados locales
  const [isMapVisible, setIsMapVisible] = useState(false);

  // 🔧 NUEVO: Efecto para actualizar departamento automáticamente
  useEffect(() => {
    console.log('🔍 useEffect disparado:', {
      categoria: formData.categoria,
      categoriasLength: categorias.length,
      departamentosLength: departamentos.length
    });

    if (formData.categoria && categorias.length > 0) {
      console.log('📊 Categorías disponibles:', categorias.map(cat => ({
        id: cat.id,
        nombre: cat.nombre,
        departamento: cat.departamento
      })));

      // Buscar la categoría seleccionada
      const selectedCategory = categorias.find(cat =>
        String(cat.id) === String(formData.categoria)
      );

      console.log('🎯 Categoría seleccionada:', selectedCategory);

      if (selectedCategory && selectedCategory.departamento) {
        // Obtener el ID del departamento
        const departmentId = String(selectedCategory.departamento.id || selectedCategory.departamento);

        console.log('🏢 Departamento detectado:', {
          departmentId,
          currentDepartment: formData.departamento,
          shouldUpdate: departmentId !== formData.departamento
        });

        // Solo actualizar si es diferente al actual
        if (departmentId !== formData.departamento) {
          console.log('🔄 Actualizando departamento automáticamente:', {
            categoria: selectedCategory.nombre,
            departamento: selectedCategory.departamento.nombre || departmentId
          });

          onFormDataChange({
            ...formData,
            departamento: departmentId
          });
        } else {
          console.log('✅ Departamento ya está correcto, no se actualiza');
        }
      } else {
        console.log('⚠️ No se encontró departamento en la categoría seleccionada');
      }
    } else {
      console.log('⏸️ Condiciones no cumplidas para actualizar departamento');
    }
  }, [formData.categoria, categorias]);

  // Handlers centralizados
  const handleInputChange = (field: keyof DenunciaFormData, value: any) => {
    onFormDataChange({ ...formData, [field]: value });
  };

const handleLocationSelect = (location: {
  latitud?: number;
  longitud?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
}) => {
  const lat = location.latitud ?? location.latitude;
  const lng = location.longitud ?? location.longitude;

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    // opcional: mostrar alerta/log si algo raro llega
    console.warn('Ubicación inválida recibida:', location);
    return;
  }

  const locationData: LocationData = {
    latitud: lat,
    longitud: lng,
    address: location.address,
  };

  onFormDataChange({
    ...formData,
    ubicacion: locationData,
    direccion: location.address || formData.direccion,
  });

  setIsMapVisible(false);
};

  // Validaciones
  const shouldShowAI = formData.titulo.length > 3 || formData.descripcion.length > 3;

  const isFormValid = Boolean(
    formData.titulo?.length >= 10 &&
    formData.descripcion?.length >= 20 &&
    formData.categoria &&
    formData.departamento
  );

  function handleAISuggestion(suggestions: Partial<DenunciaFormData>): void {
    throw new Error('Function not implemented.');
  }

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <YStack gap="$4" p="$4" pb="$6">

        {/* Información Básica */}
        <BasicInfoSection
          formData={formData}
          onChange={handleInputChange}
        />

        {/* Asistente IA (solo si hay texto) */}
        {shouldShowAI && (
          <AIAssistantSection
            formData={formData}
            onApplySuggestion={handleAISuggestion}
            categorias={categorias}
            departamentos={departamentos}
          />
        )}

        {/* Categorización */}
        <Card elevate p="$4" gap="$4">
          <H4 color="$textPrimary">🏷️ Categorización</H4>

          <YStack gap="$3">
            {/* Categoría - Ahora primero */}
            <YStack gap="$2">
              <Text fontSize="$4" color="$textPrimary">
                Categoría del Problema *
              </Text>
              <Selector
                title=""
                placeholder="Selecciona la categoría que mejor describe el problema"
                selectedValue={formData.categoria}
                options={categorias}
                onSelect={(value) => handleInputChange('categoria', value)}
                color="secondary"
              />
              {formData.categoria && (
                <Text fontSize="$3" color="$success">
                  ✅ Categoría seleccionada
                </Text>
              )}
            </YStack>

            {/* Departamento -*/}
            <YStack gap="$2">
              <Text fontSize="$4" color="$textPrimary">
                Departamento Municipal
              </Text>

              <Card
                bg="$gray2"
                borderColor="$gray6"
                borderWidth={1}
                borderRadius="$3"
                h={50}
                px="$3"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 1,
                  elevation: 1,
                }}
              >
                <XStack ai="center" jc="space-between" h="100%">
                  <XStack ai="center" gap="$2" flex={1}>
                    <Ionicons
                      name="business"
                      size={20}
                      color={formData.departamento ? "#E67E22" : "#999"}
                    />
                    <Text
                      fontSize="$4"
                      color={formData.departamento ? "$textPrimary" : "$textSecondary"}
                      flex={1}
                    >
                      {(() => {
                        if (!formData.departamento) return "Se asignará automáticamente según la categoría";
                        const department = departamentos.find(dept =>
                          String(dept.id) === String(formData.departamento)
                        );
                        return department?.nombre || '';
                      })()}
                    </Text>
                  </XStack>

                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#999"
                  />
                </XStack>
              </Card>

              <Text fontSize="$3" color="$textSecondary" style={{ fontStyle: 'italic' }}>
                ℹ️ El departamento se selecciona automáticamente basado en la categoría elegida
              </Text>

              {formData.departamento && (
                <Text fontSize="$3" color="$success">
                  ✅ Departamento asignado automáticamente
                </Text>
              )}
            </YStack>
          </YStack>
        </Card>

        {/* Ubicación */}
        <UbicacionSection
          direccion={formData.direccion}
          ubicacion={formData.ubicacion}
          onDireccionChange={(value) => handleInputChange('direccion', value)}
          onOpenMap={() => setIsMapVisible(true)}
          onRemoveLocation={() => onFormDataChange({ ...formData, ubicacion: undefined })}
        />

        {/* Evidencias con funcionalidad completa */}
        <EvidenceSection
          evidences={formData.evidencias || []}
          onEvidencesChange={(evidences) => handleInputChange('evidencias', evidences)}
          maxImages={5}
        />

        {/* Progreso del formulario */}
        <FormProgressCard formData={formData} />

        {/* Botón de envío */}
        <SubmitButton
          isValid={isFormValid}
          loading={loading}
          onSubmit={onSubmit}
        />

        {/* Información adicional */}
        <Card elevate p="$3" gap="$2">
          <XStack ai="center" gap="$2">
            <Ionicons name="information-circle" size={18} color="#667eea" />
            <Text fontSize="$4" color="#667eea">
              Información importante
            </Text>
          </XStack>
          <Text fontSize="$3" color="$textSecondary" lineHeight="$1">
            • Una vez enviada la denuncia, recibirás un código de seguimiento
          </Text>
          <Text fontSize="$3" color="$textSecondary" lineHeight="$1">
            • El asistente IA sugiere la categoría y departamento más apropiados
          </Text>
          <Text fontSize="$3" color="$textSecondary" lineHeight="$1">
            • Las evidencias (fotos) aceleran significativamente el procesamiento
          </Text>
        </Card>

        {/* Modal del Mapa */}
        <Modal
          visible={isMapVisible}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setIsMapVisible(false)}
        >
        <MapSelector
          onLocationSelect={handleLocationSelect}
          onClose={() => setIsMapVisible(false)}
          initialLocation={
            formData.ubicacion
              ? { latitud: formData.ubicacion.latitud, longitud: formData.ubicacion.longitud }
              : undefined
          }
        />
        </Modal>
      </YStack>
    </ScrollView>
  );
};

export default DenunciaForm;