import React, { useState } from 'react';
import { Text, YStack, Button, Card } from 'tamagui';
import { Alert } from 'react-native';
import { DenunciasService } from '../../services';

export default function ApiTest() {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');

  const testEndpoint = async (name: string, serviceCall: () => Promise<any>) => {
    setLoading(true);
    try {
      console.log(`🧪 Probando ${name}...`);
      const result = await serviceCall();
      const message = `✅ ${name}: ${JSON.stringify(result, null, 2)}`;
      console.log(message);
      setLastResult(message);
      Alert.alert('✅ Éxito', `${name} funcionó correctamente`);
    } catch (error) {
      const message = `❌ ${name}: ${error}`;
      console.error(message);
      setLastResult(message);
      Alert.alert('❌ Error', `${name} falló: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card bg="white" p="$4" m="$4" br="$4">
      <Text fontSize="$5" fontWeight="bold" mb="$3">
        🧪 Pruebas de API
      </Text>

      <YStack gap="$3">
        <Button
          onPress={() => testEndpoint('Departamentos', DenunciasService.getDepartamentos)}
          disabled={loading}
          bg="$primary"
        >
          <Text color="white">Probar Departamentos</Text>
        </Button>

        <Button
          onPress={() => testEndpoint('Categorías', DenunciasService.getCategorias)}
          disabled={loading}
          bg="$secondary"
        >
          <Text color="white">Probar Categorías</Text>
        </Button>

        <Button
          onPress={() => testEndpoint('Situaciones', DenunciasService.getSituaciones)}
          disabled={loading}
          bg="$municipal"
        >
          <Text color="white">Probar Situaciones</Text>
        </Button>

        <Button
          onPress={() => testEndpoint('Anuncios', DenunciasService.obtenerAnuncios)}
          disabled={loading}
          bg="$success"
        >
          <Text color="white">Probar Anuncios</Text>
        </Button>
      </YStack>

      {lastResult && (
        <Card bg="$background" p="$3" mt="$4" br="$3">
          <Text fontSize="$2" fontFamily="monospace">
            {lastResult}
          </Text>
        </Card>
      )}
    </Card>
  );
}