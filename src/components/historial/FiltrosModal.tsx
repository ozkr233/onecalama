// src/components/historial/FiltrosModal.tsx
import React, { useState } from 'react';
import { Modal } from 'react-native';
import { Sheet, YStack, XStack, Text, Button, Checkbox, Input } from 'tamagui';
import { FiltrosHistorial } from '../../types/historial';

interface FiltrosModalProps {
  visible: boolean;
  filtros: FiltrosHistorial;
  onClose: () => void;
  onAplicar: (filtros: FiltrosHistorial) => void;
  onLimpiar: () => void;
}

export const FiltrosModal: React.FC<FiltrosModalProps> = ({
  visible,
  filtros,
  onClose,
  onAplicar,
  onLimpiar
}) => {
  const [filtrosLocal, setFiltrosLocal] = useState<FiltrosHistorial>(filtros);

  const estados = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'resuelto', label: 'Resuelto' },
    { value: 'rechazado', label: 'Rechazado' },
    { value: 'cerrado', label: 'Cerrado' }
  ];

  const categorias = [
    { value: 'alumbrado', label: 'Alumbrado Público' },
    { value: 'aseo', label: 'Aseo y Ornato' },
    { value: 'transito', label: 'Tránsito' },
    { value: 'infraestructura', label: 'Infraestructura' },
    { value: 'ruidos', label: 'Ruidos Molestos' },
    { value: 'otros', label: 'Otros' }
  ];

  const toggleEstado = (estado: string) => {
    const estadosActuales = filtrosLocal.estado || [];
    const nuevosEstados = estadosActuales.includes(estado)
      ? estadosActuales.filter(e => e !== estado)
      : [...estadosActuales, estado];
    
    setFiltrosLocal({ ...filtrosLocal, estado: nuevosEstados });
  };

  const toggleCategoria = (categoria: string) => {
    const categoriasActuales = filtrosLocal.categoria || [];
    const nuevasCategorias = categoriasActuales.includes(categoria)
      ? categoriasActuales.filter(c => c !== categoria)
      : [...categoriasActuales, categoria];
    
    setFiltrosLocal({ ...filtrosLocal, categoria: nuevasCategorias });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Sheet 
        modal 
        open={visible} 
        onOpenChange={onClose}
        snapPoints={[90]}
        position={0}
      >
        <Sheet.Frame p="$4">
          <YStack gap="$4">
            <Text fontSize="$6" fontWeight="bold" textAlign="center">
              Filtros
            </Text>

            {/* Búsqueda */}
            <YStack gap="$2">
              <Text fontSize="$4" fontWeight="600">Búsqueda</Text>
              <Input
                placeholder="Buscar en título o descripción..."
                value={filtrosLocal.busqueda || ''}
                onChangeText={(text) => setFiltrosLocal({ ...filtrosLocal, busqueda: text })}
              />
            </YStack>

            {/* Estados */}
            <YStack gap="$2">
              <Text fontSize="$4" fontWeight="600">Estados</Text>
              {estados.map((estado) => (
                <XStack key={estado.value} alignItems="center" gap="$2">
                  <Checkbox
                    checked={filtrosLocal.estado?.includes(estado.value) || false}
                    onCheckedChange={() => toggleEstado(estado.value)}
                  />
                  <Text>{estado.label}</Text>
                </XStack>
              ))}
            </YStack>

            {/* Categorías */}
            <YStack gap="$2">
              <Text fontSize="$4" fontWeight="600">Categorías</Text>
              {categorias.map((categoria) => (
                <XStack key={categoria.value} alignItems="center" gap="$2">
                  <Checkbox
                    checked={filtrosLocal.categoria?.includes(categoria.value) || false}
                    onCheckedChange={() => toggleCategoria(categoria.value)}
                  />
                  <Text>{categoria.label}</Text>
                </XStack>
              ))}
            </YStack>

            {/* Botones */}
            <XStack gap="$3" mt="$4">
              <Button flex={1} variant="outlined" onPress={onLimpiar}>
                Limpiar
              </Button>
              <Button flex={1} bg="$primary" onPress={() => onAplicar(filtrosLocal)}>
                Aplicar
              </Button>
            </XStack>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </Modal>
  );
};