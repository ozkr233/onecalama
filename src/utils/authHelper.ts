// src/utils/authHelper.ts - Helper para manejar autenticación inicial
import AsyncStorage from '@react-native-async-storage/async-storage';

// Token temporal que proporcionaste
const TEMP_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU1NTQ0ODkzLCJpYXQiOjE3NTU0NTg0OTMsImp0aSI6ImQ4N2ZmNGFhOWUyYzRiNjBhY2NkOTM4ZDE1ZTM5NjFhIiwicnV0IjoiMjAxMjM5MzAtNSJ9.7aOnsnHXHNoduRqk8CPkYQ-Fk7cDrrjg1iEtbtAv3Cc';

export class AuthHelper {

  /**
   * Configurar token inicial para pruebas
   */
  static async setupInitialToken(): Promise<void> {
    try {
      console.log('🔑 Configurando token inicial...');
      await AsyncStorage.setItem('authToken', TEMP_TOKEN);
      console.log('✅ Token configurado exitosamente');
    } catch (error) {
      console.error('❌ Error configurando token:', error);
    }
  }

  /**
   * Obtener token actual
   */
  static async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
      return null;
    }
  }

  /**
   * Verificar si hay token válido
   */
  static async hasToken(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * Limpiar token
   */
  static async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
      console.log('🗑️ Token eliminado');
    } catch (error) {
      console.error('❌ Error eliminando token:', error);
    }
  }

  /**
   * Actualizar token
   */
  static async setToken(newToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem('authToken', newToken);
      console.log('🔄 Token actualizado');
    } catch (error) {
      console.error('❌ Error actualizando token:', error);
    }
  }

  /**
   * Decodificar payload del JWT (sin verificar firma)
   */
  static decodeJWT(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT inválido');
      }

      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));

      return decoded;
    } catch (error) {
      console.error('❌ Error decodificando JWT:', error);
      return null;
    }
  }

  /**
   * Verificar si el token está expirado
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeJWT(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('❌ Error verificando expiración:', error);
      return true;
    }
  }

  /**
   * Obtener información del usuario desde el token
   */
  static async getUserInfoFromToken(): Promise<any> {
    try {
      const token = await this.getToken();
      if (!token) {
        return null;
      }

      const decoded = this.decodeJWT(token);
      if (!decoded) {
        return null;
      }

      console.log('🔍 Token decodificado:', decoded);

      return {
        rut: decoded.rut,
        tokenType: decoded.token_type,
        expiresAt: new Date(decoded.exp * 1000),
        issuedAt: new Date(decoded.iat * 1000),
        jti: decoded.jti,
        // Agregar cualquier otro campo que esté en tu token
        userId: decoded.user_id, // Si tu token incluye user_id
        username: decoded.username, // Si tu token incluye username
      };
    } catch (error) {
      console.error('❌ Error obteniendo info del usuario:', error);
      return null;
    }
  }

  /**
   * Verificar estado del token actual
   */
  static async checkTokenStatus(): Promise<{
    hasToken: boolean;
    isExpired: boolean;
    userInfo: any;
    remainingTime?: string;
  }> {
    const token = await this.getToken();

    if (!token) {
      return {
        hasToken: false,
        isExpired: true,
        userInfo: null,
      };
    }

    const isExpired = this.isTokenExpired(token);
    const userInfo = await this.getUserInfoFromToken();

    let remainingTime;
    if (userInfo && !isExpired) {
      const now = new Date();
      const expiresAt = userInfo.expiresAt;
      const diffMs = expiresAt.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      remainingTime = `${diffHours}h ${diffMinutes}m`;
    }

    return {
      hasToken: true,
      isExpired,
      userInfo,
      remainingTime,
    };
  }
}

export default AuthHelper;