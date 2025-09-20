// src/components/ai/AIAssistant.tsx
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Modal, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Text, YStack, XStack, Button, Card, H4, Spinner } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { DenunciaFormData } from '../../types';
import AppHeader from '../layout/AppHeader';

// Tipos para el componente
interface AIAssistantProps {
  formData: DenunciaFormData;
  onApplySuggestion: (suggestions: Partial<DenunciaFormData>) => void;
  categorias: any[];
  departamentos: any[];
}

export interface AIAssistantRef {
  analyze: () => void;
}

interface Suggestion {
  field: string;
  value: string;
  label: string;
  reason: string;
}

// Base de conocimiento simple
const KEYWORDS_DB = {
  'luz': {
    categoria: 'Alumbrado Público',
    departamento: 'Obras Públicas',
    titulo: 'Problema con luminaria pública'
  },
  'bache': {
    categoria: 'Vialidad',
    departamento: 'Obras Públicas',
    titulo: 'Bache en la vía pública'
  },
  'basura': {
    categoria: 'Basura',
    departamento: 'Medio Ambiente',
    titulo: 'Problema con recolección de residuos'
  },
  'ruido': {
    categoria: 'Ruidos molestos',
    departamento: 'Servicios Municipales',
    titulo: 'Contaminación acústica'
  },
  'parque': {
    categoria: 'Áreas verdes',
    departamento: 'Medio Ambiente',
    titulo: 'Mantenimiento de áreas verdes'
  },
  'señal': {
    categoria: 'Señalética',
    departamento: 'Tránsito y Transporte',
    titulo: 'Problema con señalización'
  }
};

const AIAssistant = forwardRef<AIAssistantRef, AIAssistantProps>((props, ref) => {
  const { formData, onApplySuggestion, categorias, departamentos } = props;

  // Estados del componente
  const [modalVisible, setModalVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Función principal de análisis
  const analyzeText = async () => {
    const fullText = `${formData.titulo} ${formData.descripcion}`.toLowerCase().trim();

    // Validar que hay texto suficiente
    if (fullText.length < 5) {
      Alert.alert(
        '💡 Asistente IA',
        'Escribe más detalles en el título o descripción para generar sugerencias.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    // Mostrar modal y empezar análisis
    setModalVisible(true);
    setLoading(true);

    // Simular procesamiento (1.5 segundos)
    setTimeout(() => {
      const foundSuggestions: Suggestion[] = [];

      // Buscar palabras clave en el texto
      Object.entries(KEYWORDS_DB).forEach(([keyword, data]) => {
        if (fullText.includes(keyword)) {

          // 🔧 FIX: Buscar categoría correspondiente - manejar tanto OptionItem como Categoria
          const matchedCategory = categorias.find(cat => {
            const categoryName = cat.nombre || cat.name || '';
            return categoryName.toLowerCase().includes(data.categoria.toLowerCase());
          });

          // 🔧 FIX: Buscar departamento correspondiente - manejar tanto OptionItem como DepartamentoMunicipal
          const matchedDepartment = departamentos.find(dept => {
            const departmentName = dept.nombre || dept.name || '';
            return departmentName.toLowerCase().includes(data.departamento.toLowerCase());
          });

          // 🔧 FIX: Convertir IDs a string para compatibilidad
          const categoryId = matchedCategory ? String(matchedCategory.id) : null;
          const departmentId = matchedDepartment ? String(matchedDepartment.id) : null;

          // Agregar sugerencia de categoría
          if (matchedCategory && formData.categoria !== categoryId) {
            foundSuggestions.push({
              field: 'categoria',
              value: categoryId,
              label: matchedCategory.nombre || matchedCategory.name,
              reason: `Detecté que tu problema está relacionado con ${data.categoria.toLowerCase()}`
            });
          }

          // Agregar sugerencia de departamento
          if (matchedDepartment && formData.departamento !== departmentId) {
            foundSuggestions.push({
              field: 'departamento',
              value: departmentId,
              label: matchedDepartment.nombre || matchedDepartment.name,
              reason: `Este tipo de problema generalmente lo maneja ${data.departamento}`
            });
          }

          // Agregar sugerencia de título si está vacío o es muy corto
          if (!formData.titulo || formData.titulo.length < 10) {
            foundSuggestions.push({
              field: 'titulo',
              value: data.titulo,
              label: data.titulo,
              reason: 'Título sugerido basado en el tipo de problema detectado'
            });
          }
        }
      });

      // Actualizar estado
      setSuggestions(foundSuggestions);
      setLoading(false);
    }, 1500);
  };

  // Exponer función al componente padre
  useImperativeHandle(ref, () => ({
    analyze: analyzeText
  }));

  // Aplicar una sugerencia específica
  const applySingleSuggestion = (suggestion: Suggestion) => {
    const updates: Partial<DenunciaFormData> = {};
    updates[suggestion.field as keyof DenunciaFormData] = suggestion.value;

    onApplySuggestion(updates);

    Alert.alert(
      '✅ Sugerencia aplicada',
      `Se actualizó el campo "${getFieldDisplayName(suggestion.field)}" correctamente.`,
      [{ text: 'Perfecto' }]
    );
  };

  // Aplicar todas las sugerencias
  const applyAllSuggestions = () => {
    if (suggestions.length === 0) return;

    Alert.alert(
      '🎯 Aplicar todas las sugerencias',
      `¿Deseas aplicar las ${suggestions.length} sugerencias encontradas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aplicar todas',
          onPress: () => {
            const updates: Partial<DenunciaFormData> = {};

            suggestions.forEach(suggestion => {
              updates[suggestion.field as keyof DenunciaFormData] = suggestion.value;
            });

            onApplySuggestion(updates);
            setModalVisible(false);

            Alert.alert(
              '🎉 ¡Completado!',
              'Se aplicaron todas las sugerencias. Puedes revisar y modificar cualquier campo si es necesario.',
              [{ text: 'Excelente' }]
            );
          }
        }
      ]
    );
  };

  // Obtener nombre legible del campo
  const getFieldDisplayName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      titulo: 'Título',
      descripcion: 'Descripción',
      categoria: 'Categoría',
      departamento: 'Departamento'
    };
    return fieldNames[field] || field;
  };

  // Obtener emoji para el campo
  const getFieldEmoji = (field: string): string => {
    const fieldEmojis: Record<string, string> = {
      titulo: '📝',
      descripcion: '📄',
      categoria: '🏷️',
      departamento: '🏢'
    };
    return fieldEmojis[field] || '💡';
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        {/* Usar AppHeader consistente con botón de regreso */}
        <AppHeader
          screenTitle="Asistente IA"
          screenSubtitle="Sugerencias inteligentes para tu denuncia"
          screenIcon="sparkles"
          showAppInfo={false}
          showNotifications={false}
          showBackButton={true}
          onBackPress={() => setModalVisible(false)}
        />

        {/* Contenido del modal */}
        <ScrollView style={{ flex: 1 }}>
          <YStack p="$4" gap="$4">

            {/* Estado de carga */}
            {loading && (
              <Card elevate p="$4" gap="$4">
                <H4 color="$textPrimary">⏳ Analizando tu denuncia...</H4>
                <YStack ai="center" gap="$3" py="$4">
                  <Spinner size="large" color="#667eea" />
                  <Text textAlign="center" color="$textSecondary">
                    Procesando el contenido para generar sugerencias personalizadas
                  </Text>
                </YStack>
              </Card>
            )}

            {/* Sin sugerencias */}
            {!loading && suggestions.length === 0 && (
              <Card elevate p="$4" gap="$4">
                <H4 color="$textPrimary">💡 No hay sugerencias</H4>
                <YStack ai="center" gap="$3" py="$2">
                  <Ionicons name="information-circle-outline" size={48} color="#999" />
                  <Text textAlign="center" color="$textSecondary" fontSize="$4">
                    No se encontraron sugerencias para el contenido actual
                  </Text>
                  <Text textAlign="center" color="$textSecondary" fontSize="$3">
                    Intenta agregar palabras específicas como: luz, bache, basura, ruido, parque, señal
                  </Text>
                </YStack>
              </Card>
            )}

            {/* Mostrar sugerencias */}
            {!loading && suggestions.length > 0 && (
              <>
                {/* Header de resultados */}
                <Card elevate p="$4" gap="$2">
                  <H4 color="$textPrimary">
                    🎯 {suggestions.length} sugerencia{suggestions.length > 1 ? 's' : ''} encontrada{suggestions.length > 1 ? 's' : ''}
                  </H4>
                  <Text color="$textSecondary" fontSize="$4">
                    He analizado tu denuncia y encontré mejoras que pueden acelerar su procesamiento.
                  </Text>
                </Card>

                {/* Lista de sugerencias */}
                {suggestions.map((suggestion, index) => (
                  <Card key={index} elevate p="$4" gap="$4">
                    <H4 color="$textPrimary">
                      {getFieldEmoji(suggestion.field)} {getFieldDisplayName(suggestion.field)}
                    </H4>

                    <YStack gap="$3">
                      <YStack gap="$2">
                        <Text fontSize="$4" fontWeight="bold" color="$textPrimary">
                          Sugerencia:
                        </Text>
                        <Text fontSize="$4" color="$textSecondary">
                          {suggestion.label}
                        </Text>
                      </YStack>

                      <Text fontSize="$3" color="#667eea" style={{ fontStyle: 'italic' }}>
                        💡 {suggestion.reason}
                      </Text>

                      <Button
                        size="$4"
                        bg="$primary"
                        color="white"
                        fontWeight="bold"
                        onPress={() => applySingleSuggestion(suggestion)}
                        pressStyle={{ scale: 0.98 }}
                      >
                        <Ionicons name="checkmark-circle" size={16} color="white" />
                        <Text color="white" ml="$2">
                          Aplicar sugerencia
                        </Text>
                      </Button>
                    </YStack>
                  </Card>
                ))}

                {/* Botón aplicar todas */}
                {suggestions.length > 1 && (
                  <Button
                    size="$5"
                    bg="$success"
                    color="white"
                    fontWeight="bold"
                    onPress={applyAllSuggestions}
                    pressStyle={{ scale: 0.98 }}
                    style={{
                      shadowColor: '#4CAF50',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 6,
                    }}
                  >
                    <Ionicons name="flash" size={20} color="white" />
                    <Text color="white" ml="$2" fontSize="$4">
                      Aplicar todas las sugerencias
                    </Text>
                  </Button>
                )}
              </>
            )}
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
});

AIAssistant.displayName = 'AIAssistant';

export default AIAssistant;