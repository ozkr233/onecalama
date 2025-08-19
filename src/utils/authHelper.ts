// src/utils/authHelper.ts - Versión Actualizada
import AsyncStorage from '@react-native-async-storage/async-storage';

// Token actualizado - Cambia este token cuando expire
const TEMP_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU1NzMwNzg5LCJpYXQiOjE3NTU2NDQzODksImp0aSI6IjRiN2Q2MjQ0NTZlOTQ3ZjRhM2Y3NWE3MGM1MGQ1ZTE5IiwicnV0IjoiMjAxMjM5MzAtNSJ9.0fnDJKDKpbLG7xOqJ1Ko_VenivpPd0Fs_RqEhy7JFLA';

export class AuthHelper {

  /**
   * Configurar token inicial para la app
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
   * Obtener token actual (con verificación de expiración)
   */
  static async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        console.log('⚠️ No hay token, configurando inicial...');
        await this.setupInitialToken();
        return TEMP_TOKEN;
      }

      // Verificar si está expirado
      if (this.isTokenExpired(token)) {
        console.log('⚠️ Token expirado, actualizando...');
        await this.setupInitialToken();
        return TEMP_TOKEN;
      }

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
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Limpiar token completamente
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
   * Actualizar token manualmente
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
   * Forzar actualización del token (útil para desarrollo)
   */
  static async actualizarTokenForzado(): Promise<void> {
    try {
      console.log('🔄 Forzando actualización de token...');
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.setItem('authToken', TEMP_TOKEN);
      console.log('✅ Token forzado exitosamente');
    } catch (error) {
      console.error('❌ Error en actualización forzada:', error);
    }
  }

  /**
   * Limpiar AsyncStorage completo (útil para development)
   */
  static async clearAsyncStorage(): Promise<void> {
    try {
      console.log('🧹 Limpiando AsyncStorage completo...');
      await AsyncStorage.clear();
      console.log('✅ AsyncStorage limpiado');
    } catch (error) {
      console.error('❌ Error limpiando AsyncStorage:', error);
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
      const isExpired = decoded.exp < currentTime;

      if (isExpired) {
        console.log(`⏰ Token expirado: ${new Date(decoded.exp * 1000).toLocaleString()}`);
      }

      return isExpired;
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

      return {
        rut: decoded.rut,
        tokenType: decoded.token_type,
        expiresAt: new Date(decoded.exp * 1000),
        issuedAt: new Date(decoded.iat * 1000),
        jti: decoded.jti,
        userId: decoded.user_id || null,
        username: decoded.username || null,
      };
    } catch (error) {
      console.error('❌ Error obteniendo info del usuario:', error);
      return null;
    }
  }

  /**
   * Verificar estado completo del token
   */
  static async checkTokenStatus(): Promise<{
    hasToken: boolean;
    isExpired: boolean;
    userInfo: any;
    remainingTime?: string;
    tokenPreview?: string;
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
      tokenPreview: token.substring(0, 30) + '...',
    };
  }

  /**
   * Debug: Mostrar información completa del token
   */
  static async debugTokenInfo(): Promise<void> {
    console.log('🔍 === DEBUG TOKEN INFO ===');

    const status = await this.checkTokenStatus();
    console.log('📊 Estado del token:', status);

    if (status.hasToken && status.userInfo) {
      console.log('👤 Info usuario:', status.userInfo);
      console.log('⏰ Expira en:', status.remainingTime || 'Token expirado');
      console.log('🔑 Preview token:', status.tokenPreview);
    }
  }
}

export default AuthHelper;