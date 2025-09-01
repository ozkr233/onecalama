// src/utils/registerValidation.ts
export interface RegisterForm {
  rut: string;
  nombre: string;
  email: string;
  numero_telefonico_movil: string;
  password: string;
  confirmPassword: string;
}

export interface FormErrors {
  [key: string]: string;
}

// Formatear RUT mientras se escribe
export const formatRUT = (text: string): string => {
  const cleaned = text.replace(/[^0-9kK]/g, '');
  
  if (cleaned.length > 1) {
    const rutNumber = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);
    return `${rutNumber}-${dv}`;
  }
  return cleaned;
};

// Validar RUT chileno
export const validateRUT = (rut: string): boolean => {
  if (!rut || rut.length < 9) return false;
  
  const rutRegex = /^[0-9]+-[0-9kK]$/;
  return rutRegex.test(rut);
};

// Validar email - Version simplificada para debugging
export const validateEmail = (email: string): boolean => {
  if (!email || !email.trim()) return false;
  
  const trimmedEmail = email.trim().toLowerCase();
  
  // Validación básica: debe tener @ y al menos un punto después del @
  const hasAt = trimmedEmail.includes('@');
  const parts = trimmedEmail.split('@');
  
  if (!hasAt || parts.length !== 2) return false;
  
  const [localPart, domain] = parts;
  
  // Parte local no puede estar vacía
  if (!localPart || localPart.length === 0) return false;
  
  // Dominio debe tener al menos un punto y no estar vacío
  if (!domain || !domain.includes('.') || domain.length < 3) return false;
  
  // El dominio no puede empezar o terminar con punto
  if (domain.startsWith('.') || domain.endsWith('.')) return false;
  
  // Verificar que después del último punto hay al menos 2 caracteres
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2) return false;
  
  return true;
};

// Validar teléfono chileno
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Validar nombre
export const validateName = (name: string): boolean => {
  return name.trim().length >= 3;
};

// Validar contraseña
export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

// Validar formulario completo con mensajes más específicos
export const validateRegisterForm = (form: RegisterForm): FormErrors => {
  const errors: FormErrors = {};

  // Validar RUT
  if (!form.rut.trim()) {
    errors.rut = 'Debes ingresar tu RUT';
  } else if (!validateRUT(form.rut)) {
    errors.rut = 'El formato debe ser 12345678-9';
  }

  // Validar nombre
  if (!form.nombre.trim()) {
    errors.nombre = 'Debes ingresar tu nombre completo';
  } else if (!validateName(form.nombre)) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres';
  }

  // Validar email
  if (!form.email.trim()) {
    errors.email = 'Debes ingresar tu correo electrónico';
  } else if (!validateEmail(form.email)) {
    errors.email = 'El formato de email no es válido';
  }

  // Validar teléfono
  if (!form.numero_telefonico_movil.trim()) {
    errors.numero_telefonico_movil = 'Debes ingresar tu número de teléfono';
  } else if (!validatePhone(form.numero_telefonico_movil)) {
    errors.numero_telefonico_movil = 'Debe tener entre 8 y 9 dígitos';
  }

  // Validar contraseña
  if (!form.password.trim()) {
    errors.password = 'Debes crear una contraseña';
  } else if (!validatePassword(form.password)) {
    errors.password = 'Debe tener al menos 6 caracteres';
  }

  // Validar confirmación de contraseña
  if (!form.confirmPassword.trim()) {
    errors.confirmPassword = 'Debes confirmar tu contraseña';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no son iguales';
  }

  return errors;
};

// Obtener campos completados CORRECTAMENTE (sin errores) - SIN validar todo
export const getCompletedFields = (form: RegisterForm, currentErrors: FormErrors = {}): string[] => {
  return Object.keys(form).filter(key => {
    const value = form[key as keyof RegisterForm]?.trim();
    const hasError = currentErrors[key];
    return value && !hasError; // Solo cuenta si tiene valor Y no tiene error en el estado actual
  });
};

// Obtener campos que tienen contenido (independiente de errores)
export const getFieldsWithContent = (form: RegisterForm): string[] => {
  return Object.keys(form).filter(key => 
    form[key as keyof RegisterForm]?.trim()
  );
};

// Obtener estados de todos los campos para el progreso con mensajes de error
export const getFieldStatuses = (form: RegisterForm, currentErrors: FormErrors) => {
  return FORM_FIELDS.map(field => {
    const hasContent = Boolean(form[field.key as keyof RegisterForm]?.trim());
    const hasError = Boolean(currentErrors[field.key]);
    
    return {
      key: field.key,
      label: field.label,
      completed: hasContent && !hasError, // Solo completado si tiene contenido Y no tiene error ACTUAL
      hasContent,
      hasError,
      errorMessage: currentErrors[field.key] || undefined
    };
  });
};

// Definición de campos del formulario
export const FORM_FIELDS = [
  { key: 'rut', label: 'RUT' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'numero_telefonico_movil', label: 'Teléfono' },
  { key: 'password', label: 'Contraseña' },
  { key: 'confirmPassword', label: 'Confirmar' }
] as const;