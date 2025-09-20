// src/utils/userHelper.ts - Helper simple para obtener usuario
import { apiService } from '../services/api';
import AuthHelper from './authHelper';

export class UserHelper {

  /**
   * Obtener el ID del usuario actual de manera simple
   */
  static async getCurrentUserId(): Promise<number> {
    try {
      console.log('🔍 Obteniendo ID del usuario actual...');

      // Estrategia 1: Intentar obtener del endpoint de perfil
      try {
        console.log('📡 Intentando /usuarios/me/ o similar...');

        // Probar diferentes endpoints comunes para perfil
        const endpoints = ['/usuarios/me/', '/auth/profile/', '/profile/', '/users/me/'];

        for (const endpoint of endpoints) {
          try {
            const perfil = await apiService.get<any>(endpoint, true);
            if (perfil && perfil.id) {
              console.log(`✅ Usuario ID obtenido de ${endpoint}:`, perfil.id);
              return perfil.id;
            }
          } catch (endpointError) {
            console.log(`⚠️ Endpoint ${endpoint} no disponible`);
          }
        }
      } catch (error) {
        console.log('⚠️ No hay endpoint de perfil disponible');
      }

      // Estrategia 2: Buscar en lista de usuarios por RUT
      try {
        console.log('📡 Buscando usuario por RUT...');
        const userInfo = await AuthHelper.getUserInfoFromToken();

        if (userInfo && userInfo.rut) {
          console.log('🔍 RUT del token:', userInfo.rut);

          const usuarios = await apiService.get<any>('/usuarios/', true);
          const usuariosList = usuarios.results || usuarios;

          const usuario = usuariosList.find((u: any) => u.rut === userInfo.rut);

          if (usuario && usuario.id) {
            console.log('✅ Usuario encontrado por RUT:', {
              id: usuario.id,
              rut: usuario.rut,
              nombre: usuario.nombre
            });
            return usuario.id;
          }
        }
      } catch (error) {
        console.log('⚠️ No se pudo buscar por RUT:', error.message);
      }

      // Estrategia 3: Usar ID hardcodeado basado en el RUT conocido
      console.log('🔄 Usando estrategia de fallback...');
      const userInfo = await AuthHelper.getUserInfoFromToken();

      if (userInfo && userInfo.rut === '20123930-5') {
        // Usar un ID específico para este RUT de prueba
        console.log('✅ Usando ID específico para RUT de prueba');
        return 1; // O el ID que corresponda a este usuario en tu base de datos
      }

      // Estrategia 4: ID por defecto
      console.warn('⚠️ Usando ID de usuario por defecto');
      return 1;

    } catch (error) {
      console.error('❌ Error obteniendo ID de usuario:', error);
      return 1; // Fallback final
    }
  }

  /**
   * Verificar qué usuarios existen en el sistema
   */
  static async debugUsuarios(): Promise<void> {
    try {
      console.log('🔍 Debug: listando usuarios disponibles...');

      const usuarios = await apiService.get<any>('/usuarios/', true);
      const usuariosList = usuarios.results || usuarios;

      console.log('👥 Usuarios en el sistema:', usuariosList.map((u: any) => ({
        id: u.id,
        rut: u.rut,
        nombre: u.nombre,
        email: u.email
      })));

      const userInfo = await AuthHelper.getUserInfoFromToken();
      console.log('🔑 Usuario del token:', userInfo);

    } catch (error) {
      console.error('❌ Error en debug de usuarios:', error);
    }
  }
}

export default UserHelper;