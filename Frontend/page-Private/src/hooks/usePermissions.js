import { useAuth } from '../context/AuthContext';

/**
 * Hook para verificar permisos basados en roles
 * 
 * Uso:
 * const { canCreate, canEdit, canDelete, hasRole } = usePermissions();
 * 
 * if (canDelete) {
 *   // Mostrar botón de eliminar
 * }
 */
export const usePermissions = () => {
  const {
    userRole,
    user,
    hasRole,
    canCreate,
    canEdit,
    canDelete,
    canViewReports,
  } = useAuth();

  return {
    userRole,
    isAdmin: user?.userType === 'Administrador',
    isSupervisor: userRole === 'Supervisor',
    isOperativo: userRole === 'Operativo',
    hasRole,
    canCreate,
    canEdit,
    canDelete,
    canViewReports,
  };
};
