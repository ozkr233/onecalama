// src/hooks/useAuth.ts - Hook de autenticación simplificado
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';

interface User {
  id: number;
  nombre: string;
  email: string;
  rut: string;
  es_administrador: boolean;
  numero_telefonico_movil?: string;
  fecha_registro: string;
  esta_activo: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Verificando estado de autenticación...');
      
      const token = await AsyncStorage.getItem('authToken');
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      
      if (token) {
        if (userInfoStr) {
          // Si tenemos token y userInfo, usar los datos guardados
          const userInfo = JSON.parse(userInfoStr);
          setAuthState({
            user: userInfo,
            isAuthenticated: true,
            isLoading: false,
          });
          console.log('✅ Usuario cargado desde storage:', userInfo.nombre);
        } else {
          // Si solo tenemos token, obtener datos del servidor
          await fetchUserProfile();
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('❌ Error verificando auth:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const fetchUserProfile = async () => {
    try {
      console.log('👤 Obteniendo perfil del usuario desde servidor...');
      
      const profile = await apiService.getProfile();
      
      const userInfo: User = {
        id: profile.id,
        nombre: profile.nombre,
        email: profile.email,
        rut: profile.rut,
        es_administrador: profile.es_administrador || false,
        numero_telefonico_movil: profile.numero_telefonico_movil,
        fecha_registro: profile.fecha_registro,
        esta_activo: profile.esta_activo,
      };

      // Guardar en storage
      await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      setAuthState({
        user: userInfo,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log('✅ Perfil del usuario cargado:', userInfo.nombre);

    } catch (error: any) {
      console.error('❌ Error obteniendo perfil:', error);
      
      if (error.status === 401) {
        // Token inválido, limpiar todo
        await clearAuthData();
      } else {
        // Otro error, mantener autenticado pero sin datos completos
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    }
  };

  const login = async (rut: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      console.log('🔐 Intentando login con RUT:', rut);
      const response = await apiService.login(rut, password);
      
      if (response.access || response.access_token || response.token) {
        const token = response.access || response.access_token || response.token;
        
        // Guardar token
        await AsyncStorage.setItem('authToken', token);
        
        // Guardar refresh token si existe
        if (response.refresh) {
          await AsyncStorage.setItem('refreshToken', response.refresh);
        }
        
        // Obtener datos del usuario
        await fetchUserProfile();
        
        return { success: true };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
      
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response?.status === 401) {
        errorMessage = 'RUT o contraseña incorrectos';
      } else if (error.response?.status === 400) {
        errorMessage = 'Datos inválidos';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData: {
    rut: string;
    nombre: string;
    email: string;
    numero_telefonico_movil: string;
    password: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiService.post('/registro/', {
        ...userData,
        es_administrador: false,
        esta_activo: true,
      }, false);
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      return { success: true, data: response };
      
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      let errorMessage = 'Error al crear la cuenta';
      
      if (error.response?.status === 400) {
        const data = error.response.data;
        if (data.email) {
          errorMessage = 'El email ya está registrado';
        } else if (data.rut) {
          errorMessage = 'El RUT ya está registrado';
        } else if (data.numero_telefonico_movil) {
          errorMessage = 'El teléfono ya está registrado';
        } else {
          errorMessage = 'Datos inválidos. Verifica tu información.';
        }
      } else if (error.response?.status === 409) {
        errorMessage = 'El usuario ya existe';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.warn('⚠️ Error en logout del servidor:', error);
    } finally {
      await clearAuthData();
      router.replace('/auth/login');
    }
  };

  const refreshUserInfo = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await fetchUserProfile();
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error refrescando info del usuario:', error);
      return { success: false, error: error.message };
    }
  };

  const clearAuthData = async () => {
    await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userInfo']);
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return {
    ...authState,
    login,
    register,
    logout,
    refreshUserInfo,
    checkAuthStatus,
  };
};