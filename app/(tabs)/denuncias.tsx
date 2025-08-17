// app/(tabs)/denuncias.tsx
import React, { useState, useEffect } from 'react';
import { SafeAreaView, Alert } from 'react-native';
import DenunciaForm from '../../src/components/forms/DenunciaForm';
import { DenunciaFormData } from '../../src/types';
import AppHeader from '../../src/components/layout/AppHeader';
import { DenunciasService } from '../../src/services';

// 🔧 Tipo para normalizar los datos
interface NormalizedOption {
  id: string;
  nombre: string;
}

interface NormalizedCategory extends NormalizedOption {
  departamento?: {
    id: number;
    nombre: string;
  };
}

export default function DenunciasScreen() {
  const [formData, setFormData] = useState<DenunciaFormData>({
    titulo: '',
    descripcion: '',
    categoria: '',
    departamento: '',
    direccion: '',
    ubicacion: undefined,
    evidencias: [] // Inicializar con un array vacío
  });

  const [loading, setLoading] = useState(false);
  const [departamentos, setDepartamentos] = useState<NormalizedOption[]>([]);
  const [categorias, setCategorias] = useState<NormalizedCategory[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      console.log('🔄 Cargando datos desde la API...');
      const [deptData, catData] = await Promise.all([
        DenunciasService.getDepartamentos(),
        DenunciasService.getCategorias(),
      ]);

      // 🔧 FIX: Normalizar los datos para que siempre tengan id como string
      const departamentosNormalizados: NormalizedOption[] = deptData.map(dept => ({
        id: String(dept.id), // Convertir a string
        nombre: dept.nombre
      }));

      // 🔧 FIX: Mantener categorías con información del departamento COMPLETA
      const categoriasNormalizadas = catData.map(cat => ({
        id: String(cat.id), // Convertir a string
        nombre: cat.nombre,
        departamento: cat.departamento // Mantener la relación COMPLETA con el departamento
      }));

      setDepartamentos(departamentosNormalizados);
      setCategorias(categoriasNormalizadas);

      console.log('✅ Datos cargados y normalizados:', {
        departamentos: departamentosNormalizados.length,
        categorias: categoriasNormalizadas.length
      });

      // 🔧 Debug: Verificar estructura completa
      console.log('📊 Estructura departamentos:', departamentosNormalizados);
      console.log('📊 Estructura categorías con departamentos:', categoriasNormalizadas.map(cat => ({
        id: cat.id,
        nombre: cat.nombre,
        departamento: cat.departamento
      })));

    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos necesarios. Se usarán datos por defecto.');

      // 🔧 Datos de fallback normalizados con departamentos COMPLETOS
      setDepartamentos([
        { id: '1', nombre: 'Obras Públicas' },
        { id: '2', nombre: 'Medio Ambiente' },
        { id: '3', nombre: 'Servicios Municipales' },
      ]);

      setCategorias([
        {
          id: '1',
          nombre: 'Seguridad',
          departamento: { id: 3, nombre: 'Servicios Municipales' }
        },
        {
          id: '2',
          nombre: 'Basura',
          departamento: { id: 2, nombre: 'Medio Ambiente' }
        },
        {
          id: '3',
          nombre: 'Áreas verdes',
          departamento: { id: 2, nombre: 'Medio Ambiente' }
        },
        {
          id: '4',
          nombre: 'Mantención de Calles',
          departamento: { id: 1, nombre: 'Obras Públicas' }
        },
        {
          id: '5',
          nombre: 'Alumbrado Público',
          departamento: { id: 1, nombre: 'Obras Públicas' }
        },
      ]);

      console.log('🔧 Usando datos de fallback con departamentos');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('📤 Enviando publicación:', formData);

      const nuevaPublicacion = await DenunciasService.crearPublicacion(formData);

      console.log('✅ Publicación creada:', nuevaPublicacion);

      Alert.alert(
        '✅ Denuncia Enviada',
        `Tu denuncia ha sido registrada con el código: ${nuevaPublicacion.codigo}. Te notificaremos sobre su progreso.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                titulo: '',
                descripcion: '',
                categoria: '',
                departamento: '',
                direccion: '',
                ubicacion: undefined,
                evidencias: [] 
              });
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ Error enviando publicación:', error);
      Alert.alert(
        '❌ Error',
        'No se pudo enviar la denuncia. Verifica tu conexión e intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <AppHeader
        screenTitle="Nueva Denuncia"
        screenSubtitle="Reporta problemas en tu comunidad"
        screenIcon="megaphone"
      />

      <DenunciaForm
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        loading={loading}
        departamentos={departamentos} // Datos normalizados
        categorias={categorias}       // Datos normalizados
      />
    </SafeAreaView>
  );
}