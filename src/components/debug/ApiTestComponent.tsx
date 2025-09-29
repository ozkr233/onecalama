// src/components/debug/ApiTestComponent.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { ACTIVE_CONFIG, ENDPOINTS } from '../../constants/api';
import AuthHelper from '../../utils/authHelper';

interface TestResult {
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  data?: any;
  error?: string;
  duration?: number;
}

const ApiTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<any>(null);

  // Verificar estado del token al cargar
  useEffect(() => {
    checkTokenStatus();
    setupToken();
  }, []);

  const setupToken = async () => {
    await AuthHelper.setupInitialToken();
    checkTokenStatus();
  };

  const checkTokenStatus = async () => {
    const status = await AuthHelper.checkTokenStatus();
    setTokenStatus(status);
    console.log('🔍 Estado del token:', status);
  };

  // Función para probar un endpoint específico
  const testEndpoint = async (name: string, endpoint: string, needsAuth: boolean = true) => {
    const startTime = Date.now();

    setTestResults(prev => [
      ...prev.filter(r => r.endpoint !== name),
      { endpoint: name, status: 'pending' }
    ]);

    try {
      const url = `${ACTIVE_CONFIG.baseURL}${endpoint}`;
      console.log(`🔄 Testing: ${url}`);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Agregar token de autenticación (ahora por defecto)
      if (needsAuth) {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU1NTQ0ODkzLCJpYXQiOjE3NTU0NTg0OTMsImp0aSI6ImQ4N2ZmNGFhOWUyYzRiNjBhY2NkOTM4ZDE1ZTM5NjFhIiwicnV0IjoiMjAxMjM5MzAtNSJ9.7aOnsnHXHNoduRqk8CPkYQ-Fk7cDrrjg1iEtbtAv3Cc';
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token agregado a headers');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ACTIVE_CONFIG.timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const duration = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${name} Success:`, data);

        setTestResults(prev => [
          ...prev.filter(r => r.endpoint !== name),
          {
            endpoint: name,
            status: 'success',
            data: Array.isArray(data) ? `Array con ${data.length} elementos` :
                  data.results ? `Paginado: ${data.results.length} elementos` : data,
            duration
          }
        ]);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${name} Error:`, error);

      setTestResults(prev => [
        ...prev.filter(r => r.endpoint !== name),
        {
          endpoint: name,
          status: 'error',
          error: error.message,
          duration
        }
      ]);
    }
  };

  // Probar endpoint de categorías (sin health por ahora)
  const testCategorias = () => testEndpoint('Categorías', ENDPOINTS.CATEGORIAS);

  // Probar departamentos municipales
  const testDepartamentos = () => testEndpoint('Departamentos', ENDPOINTS.DEPARTAMENTOS);

  // Probar juntas vecinales
  const testJuntasVecinales = () => testEndpoint('Juntas Vecinales', ENDPOINTS.JUNTAS_VECINALES);

  // Probar publicaciones (necesita auth)
  const testPublicaciones = () => testEndpoint('Publicaciones', ENDPOINTS.PUBLICACIONES, true);

  // Probar anuncios municipales
  const testAnuncios = () => testEndpoint('Anuncios', ENDPOINTS.ANUNCIOS);

  // Probar todos los endpoints básicos
  const testAllBasic = async () => {
    setIsTestingAll(true);
    setTestResults([]);

    try {
      await testCategorias();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testDepartamentos();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testJuntasVecinales();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testAnuncios();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testPublicaciones();

      Alert.alert('✅ Pruebas Completadas', 'Revisa los resultados abajo');
    } catch (error) {
      Alert.alert('❌ Error', 'Hubo un error durante las pruebas');
    } finally {
      setIsTestingAll(false);
    }
  };

  // Limpiar resultados
  const clearResults = () => setTestResults([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔧 Test de Conexión API</Text>
        <Text style={styles.subtitle}>
          Servidor: {ACTIVE_CONFIG.baseURL}
        </Text>

        {/* Estado del Token */}
        <View style={styles.tokenStatus}>
          <Text style={styles.tokenTitle}>🔑 Estado del Token:</Text>
          {tokenStatus ? (
            <>
              <Text style={[styles.tokenText, { color: tokenStatus.hasToken ? '#10B981' : '#EF4444' }]}>
                {tokenStatus.hasToken ? '✅ Token disponible' : '❌ Sin token'}
              </Text>
              {tokenStatus.hasToken && (
                <>
                  <Text style={[styles.tokenText, { color: tokenStatus.isExpired ? '#EF4444' : '#10B981' }]}>
                    {tokenStatus.isExpired ? '⏰ Token expirado' : `⏰ Válido por ${tokenStatus.remainingTime}`}
                  </Text>
                  {tokenStatus.userInfo && (
                    <Text style={styles.tokenText}>
                      👤 RUT: {tokenStatus.userInfo.rut}
                    </Text>
                  )}
                </>
              )}
            </>
          ) : (
            <Text style={styles.tokenText}>⏳ Verificando...</Text>
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={testAllBasic}
          disabled={isTestingAll}
        >
          <Text style={styles.buttonText}>
            {isTestingAll ? '⏳ Probando...' : '🚀 Probar Todo'}
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.smallButton} onPress={testCategorias}>
            <Text style={styles.smallButtonText}>Categorías</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallButton} onPress={testDepartamentos}>
            <Text style={styles.smallButtonText}>Departamentos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.smallButton} onPress={testJuntasVecinales}>
            <Text style={styles.smallButtonText}>Juntas V.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallButton} onPress={testAnuncios}>
            <Text style={styles.smallButtonText}>Anuncios</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={checkTokenStatus}
        >
          <Text style={styles.buttonTextSecondary}>🔄 Verificar Token</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={clearResults}
        >
          <Text style={styles.buttonTextSecondary}>🗑️ Limpiar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>📊 Resultados:</Text>
        {testResults.length === 0 ? (
          <Text style={styles.noResults}>No hay resultados aún</Text>
        ) : (
          testResults.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultIcon}>
                  {getStatusIcon(result.status)}
                </Text>
                <Text style={styles.resultEndpoint}>{result.endpoint}</Text>
                {result.duration && (
                  <Text style={styles.resultDuration}>
                    {result.duration}ms
                  </Text>
                )}
              </View>

              {result.status === 'success' && result.data && (
                <Text style={styles.resultData}>
                  📦 {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                </Text>
              )}

              {result.status === 'error' && result.error && (
                <Text style={styles.resultError}>
                  💥 {result.error}
                </Text>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  tokenStatus: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  tokenTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  tokenText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  secondaryButton: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  smallButton: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  smallButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  noResults: {
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  resultItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E5E7EB',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  resultEndpoint: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  resultDuration: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  resultData: {
    fontSize: 12,
    color: '#059669',
    fontFamily: 'monospace',
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 4,
  },
  resultError: {
    fontSize: 12,
    color: '#DC2626',
    fontFamily: 'monospace',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 4,
  },
});

export default ApiTestComponent;