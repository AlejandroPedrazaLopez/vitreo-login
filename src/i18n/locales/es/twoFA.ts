export const twoFA = {
  setup: {
    title: "Configurar autenticación de dos factores",
    description: "La autenticación de dos factores agrega una capa adicional de seguridad a tu cuenta",
    start: "Comenzar configuración",
    error: "No se pudo configurar la autenticación de dos factores",
    success: "La a  utenticación de dos factores ha sido configurada",
  },
  verify: {
    title: "Verificar autenticación de dos factores",
    description: "Verifica tu código de autenticación de dos factores",
    manual: "Usa Google Authenticator o cualquier otra aplicación compatible",
    code: "Ingresa el código de 6 dígitos de tu aplicación",
    verify: "Verificar y activar",
    error: "Código inválido. Por favor, inténtalo de nuevo",
    recovery: "¿No tienes tu aplicación de autenticación? Usa los códigos de recuperación",
    back: "Regresar"
  },
  recovery: {
    title: "Códigos de recuperación",
    description: "Guarda estos códigos en un lugar seguro. Los necesitarás si pierdes acceso a tu dispositivo.",
    warning: "¡Estos códigos solo se mostrarán una vez!",
    continue: "Continuar al dashboard",
  },
};