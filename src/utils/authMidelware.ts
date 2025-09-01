// src/utils/authMiddleware.ts
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from '../constants/api';

class AuthMiddleware {
  private static isRefreshing = false;
  private static refreshSubscribers: Array<(token: string) => void> = [];

  /**
   * Verificar si el usuario está autenticado
   */
  static async checkAuth(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userInfo = await AsyncStorage.getItem('userInfo');
      
      if (!token || !userInfo) {
        return false;
      }

      return true;
      
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      return false;
    }
  }

  /**
   * Obtener el token actual
   */
  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
      return null;
    }
  }

  /**
   * Obtener información del usuario
   */
  static async getUserInfo(): Promise<any | null> {
    try {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      return userInfoStr ? JSON.parse(userInfoStr) : null;
    } catch (error) {
      console.error('❌ Error obteniendo info del usuario:', error);
      return null;
    }
  }

  /**
   * Refrescar el token de acceso
   */
  static async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        console.log('❌ No hay refresh token disponible');
        return false;
      }

      console.log('🔄 Refrescando token...');
      
      // Obtener la URL base desde las constantes
      const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.8.103:8000/api/v1';
      
      const response = await fetch(`${baseURL}${ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.access) {
        await AsyncStorage.setItem('authToken', data.access);
        console.log('✅ Token refrescado exitosamente');
        return true;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
      
    } catch (error) {
      console.error('❌ Error refrescando token:', error);
      await this.handleAuthFailure();
      return false;
    }
  }

  /**
   * Manejar fallo de autenticación
   */
  static async handleAuthFailure() {
    try {
      console.log('🚪 Sesión expirada, redirigiendo al login...');
      
      // Limpiar datos de autenticación
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userInfo']);
      
      // Redirigir al login
      router.replace('/auth/login');
      
    } catch (error) {
      console.error('❌ Error manejando fallo de auth:', error);
    }
  }

  /**
   * Interceptar respuestas HTTP para manejar tokens expirados
   */
  static async handleApiResponse(response: any): Promise<any> {
    // Si la respuesta es exitosa, devolver tal como está
    if (response.status < 400) {
      return response;
    }

    // Si es error 401 (no autorizado), intentar refrescar token
    if (response.status === 401 && !this.isRefreshing) {
      console.log('🔄 Token expirado, intentando refrescar...');
      
      this.isRefreshing = true;
      
      try {
        const refreshed = await this.refreshToken();
        this.isRefreshing = false;
        
        if (!refreshed) {
          await this.handleAuthFailure();
        }
        
        return response;
        
      } catch (error) {
        console.error('❌ Error en refresh automático:', error);
        this.isRefreshing = false;
        await this.handleAuthFailure();
        return response;
      }
    }

    return response;
  }

  /**
   * Limpiar datos de autenticación
   */
  static async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userInfo']);
      console.log('✅ Datos de autenticación limpiados');
    } catch (error) {
      console.error('❌ Error limpiando datos de auth:', error);
    }
  }
}

export default AuthMiddleware;