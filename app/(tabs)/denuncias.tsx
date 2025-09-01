// app/(tabs)/denuncias.tsx - CONECTADO A TU API DJANGO REAL
import React, { useState, useEffect } from 'react';
import { SafeAreaView, Alert, Text, View } from 'react-native';
import DenunciaForm from '../../src/components/forms/DenunciaForm';
import { DenunciaFormData } from '../../src/types/denuncias';
import AppHeader from '../../src/components/layout/AppHeader';
import { denunciasService } from '../../src/services/denuncias';

export default function DenunciasScreen() {
  // Estado inicial del formulario
  const [formData, setFormData] = useState<DenunciaFormData>({
    titulo: '',
    descripcion: '',
    categoria: '',
    departamento: '',
    direccion: '',
    ubicacion: undefined,
    evidencias: [],
  });

  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Datos REALES desde tu Django API
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [juntasVecinales, setJuntasVecinales] = useState<any[]>([]);

  // Estados de conexión
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingInitial(true);
      setConnectionError(null);

      console.log('🔄 Iniciando carga de datos desde Django...');

      // Cargar todos los datos desde tu API real
      const {
        categorias: categoriasData,
        departamentos: departamentosData,
        juntasVecinales: juntasData,
        isAuthenticated: authStatus
      } = await denunciasService.cargarDatosIniciales();

      setIsAuthenticated(authStatus);

      if (!authStatus) {
        throw new Error('Token expirado o inválido. Verifica tu autenticación.');
      }

      // Validar que tengamos datos mínimos
      if (categoriasData.length === 0 || departamentosData.length === 0) {
        throw new Error('No se pudieron cargar las categorías o departamentos desde el servidor');
      }

      setDepartamentos(departamentosData);
      setCategorias(categoriasData);
      setJuntasVecinales(juntasData);

      console.log('✅ Datos REALES cargados desde Django:', {
        departamentos: departamentosData.length,
        categorias: categoriasData.length,
        juntasVecinales: juntasData.length
      });

      // Mostrar los primeros datos para debug
      console.log('📋 Categorías cargadas:', categoriasData.slice(0, 3).map(c => c.nombre));
      console.log('📋 Departamentos cargados:', departamentosData.slice(0, 3).map(d => d.nombre));

    } catch (error) {
      console.error('❌ Error cargando datos desde Django:', error);
      setConnectionError(error.message);

      Alert.alert(
        '⚠️ Error de Conexión',
        `No se pudieron cargar los datos desde tu servidor Django:\n\n${error.message}\n\n¿Quieres reintentar?`,
        [
          {
            text: 'Reintentar',
            onPress: () => loadInitialData()
          },
          {
            text: 'Debug API',
            onPress: () => {
              // Navegar a la pantalla de debug
              Alert.alert('Debug', 'Ve a la pantalla de test-api para verificar la conexión');
            }
          },
          {
            text: 'Usar datos offline',
            style: 'cancel',
            onPress: () => useOfflineData()
          }
        ]
      );
    } finally {
      setLoadingInitial(false);
    }
  };

  const useOfflineData = () => {
    console.log('🔄 Usando datos offline por defecto...');

    setDepartamentos([
      { id: 1, nombre: 'Obras Públicas' },
      { id: 2, nombre: 'Seguridad Ciudadana' },
      { id: 3, nombre: 'Medio Ambiente' },
      { id: 4, nombre: 'Servicios Públicos' },
    ]);

    setCategorias([
      { id: 1, nombre: 'Infraestructura' },
      { id: 2, nombre: 'Servicios Públicos' },
      { id: 3, nombre: 'Seguridad' },
      { id: 4, nombre: 'Medio Ambiente' },
    ]);

    setJuntasVecinales([]);
    setConnectionError(null);
    setIsAuthenticated(false);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        '⚠️ Sin Autenticación',
        'No hay una sesión válida. ¿Quieres verificar la conexión?',
        [
          {
            text: 'Verificar',
            onPress: () => loadInitialData()
          },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Enviando publicación a Django...');
      console.log('📊 Datos del formulario:', {
        titulo: formData.titulo,
        categoria: formData.categoria,
        departamento: formData.departamento,
        evidencias: formData.evidencias.length
      });

      // Crear publicación en tu Django backend
      const nuevaPublicacion = await denunciasService.crearPublicacion(formData);

      console.log('✅ Publicación creada exitosamente en Django:', nuevaPublicacion);

      // Mostrar mensaje de éxito con el código real de Django
      Alert.alert(
        '✅ ¡Denuncia Enviada a Django!',
        `Tu denuncia ha sido registrada exitosamente:\n\n` +
        `📄 Código: ${nuevaPublicacion.codigo}\n` +
        `🏷️ Título: ${nuevaPublicacion.titulo}\n` +
        `📅 Fecha: ${new Date(nuevaPublicacion.fecha_publicacion).toLocaleDateString()}\n\n` +
        `${formData.evidencias.length > 0 ?
          `📎 Evidencias: ${formData.evidencias.length} archivo(s)\n` : ''
        }Te notificaremos sobre el progreso de tu solicitud.`,
        [
          {
            text: '🎉 Perfecto',
            onPress: () => {
              // Limpiar formulario
              setFormData({
                titulo: '',
                descripcion: '',
                categoria: '',
                departamento: '',
                direccion: '',
                ubicacion: undefined,
                evidencias: [],
              });
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ Error enviando publicación a Django:', error);

      Alert.alert(
        '❌ Error al Enviar',
        `No se pudo enviar la denuncia a Django:\n\n${error.message}\n\nVerifica tu conexión e intenta nuevamente.`,
        [
          { text: 'OK' },
          {
            text: 'Verificar Conexión',
            onPress: () => loadInitialData()
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading inicial
  if (loadingInitial) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <AppHeader screenTitle="Nueva Denuncia" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, color: '#3B82F6', marginBottom: 10 }}>
            🔄 Conectando con Django...
          </Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
            Cargando categorías y departamentos desde tu servidor
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppHeader
        screenTitle="Nueva Denuncia"
        screenSubtitle="Reporta un problema en tu comuna"
        screenIcon="document-outline"
          showAppInfo={false}
        />

      <DenunciaForm
        formData={formData}
        onFormDataChange={(next) => setFormData(next)}
        onSubmit={handleSubmit}
        loading={loading}
        departamentos={departamentos}
        categorias={categorias}
        juntasVecinales={juntasVecinales}
      />
    </SafeAreaView>
  );
}