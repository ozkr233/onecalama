// src/utils/userHelper.ts - CORREGIDO para usar la info disponible
import { apiService } from '../services/api';
import AuthHelper from './authHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class UserHelper {

  /**
   * Obtener el ID del usuario actual - CORREGIDO
   */
  static async getCurrentUserId(): Promise<number> {
  console.log('🔍 [NUEVO] Obteniendo ID del usuario actual...');
  
  try {
    // PRIMERO: AsyncStorage userInfo (donde está el perfil completo)
    const userInfoStr = await AsyncStorage.getItem('userInfo');
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      if (userInfo?.id) {
        console.log('✅ [NUEVO] ID desde userInfo:', userInfo.id);
        return userInfo.id;
      }
    }
  } catch (error) {
    console.log('⚠️ [NUEVO] Error leyendo userInfo');
  }
  
  try {
    // SEGUNDO: AsyncStorage userId directo
    const userIdStr = await AsyncStorage.getItem('userId');
    if (userIdStr) {
      const userId = parseInt(userIdStr);
      if (!isNaN(userId)) {
        console.log('✅ [NUEVO] ID desde userId:', userId);
        return userId;
      }
    }
  } catch (error) {
    console.log('⚠️ [NUEVO] Error leyendo userId');
  }

  // Si llega aquí, HAY UN PROBLEMA
  console.error('❌ [NUEVO] NO SE PUDO OBTENER ID DEL USUARIO');
  throw new Error('No se pudo obtener el ID del usuario. Verifica tu sesión.');
}
  /**
   * Verificar qué usuarios existen en el sistema
   */
  static async debugUsuarios(): Promise<void> {
    try {
      console.log('🔍 === DEBUG USUARIO ACTUAL ===');

      // Debug AsyncStorage
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      const userIdStr = await AsyncStorage.getItem('userId');
      const authToken = await AsyncStorage.getItem('authToken');

      console.log('📦 AsyncStorage:', {
        userInfo: userInfoStr ? JSON.parse(userInfoStr) : null,
        userId: userIdStr,
        hasToken: !!authToken
      });

      // Debug token JWT
      const tokenInfo = await AuthHelper.getUserInfoFromToken();
      console.log('🔑 Token JWT:', tokenInfo);

      // Debug perfil desde API
      try {
        const perfil = await apiService.getProfile();
        console.log('👤 Perfil API:', perfil);
      } catch (error) {
        console.log('❌ Error obteniendo perfil API:', error);
      }

    } catch (error) {
      console.error('❌ Error en debug de usuarios:', error);
    }
  }
}

export default UserHelper;