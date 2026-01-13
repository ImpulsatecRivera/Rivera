import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * Componente para mostrar/ocultar elementos basado en permisos
 * 
 * Uso:
 * <ProtectedAction action="delete" fallback={<span>No tienes permiso</span>}>
 *   <button onClick={handleDelete}>Eliminar</button>
 * </ProtectedAction>
 * 
 * O más simple:
 * <ProtectedAction action="edit">
 *   <button>Editar</button>
 * </ProtectedAction>
 */
export const ProtectedAction = ({ 
  action = 'view', 
  children, 
  fallback = null,
  requiredRole = null,
}) => {
  const { canCreate, canEdit, canDelete, canViewReports, hasRole } = usePermissions();

  let hasPermission = false;

  switch (action) {
    case 'create':
      hasPermission = canCreate();
      break;
    case 'edit':
    case 'update':
      hasPermission = canEdit();
      break;
    case 'delete':
      hasPermission = canDelete();
      break;
    case 'view-reports':
      hasPermission = canViewReports();
      break;
    case 'custom':
      hasPermission = requiredRole ? hasRole(requiredRole) : false;
      break;
    default:
      hasPermission = true;
  }

  if (!hasPermission) {
    return fallback;
  }

  return <>{children}</>;
};

/**
 * Componente para deshabilitar botones si no tiene permisos
 * 
 * Uso:
 * <DisableableButton action="delete" onClick={handleDelete}>
 *   Eliminar
 * </DisableableButton>
 */
export const DisableableButton = ({ 
  action = 'view',
  children, 
  requiredRole = null,
  className = '',
  ...props 
}) => {
  const { canCreate, canEdit, canDelete, canViewReports, hasRole } = usePermissions();

  let hasPermission = false;

  switch (action) {
    case 'create':
      hasPermission = canCreate();
      break;
    case 'edit':
    case 'update':
      hasPermission = canEdit();
      break;
    case 'delete':
      hasPermission = canDelete();
      break;
    case 'view-reports':
      hasPermission = canViewReports();
      break;
    case 'custom':
      hasPermission = requiredRole ? hasRole(requiredRole) : false;
      break;
    default:
      hasPermission = true;
  }

  return (
    <button 
      {...props}
      disabled={!hasPermission}
      className={`${className} ${!hasPermission ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={!hasPermission ? 'No tienes permisos para esta acción' : ''}
    >
      {children}
    </button>
  );
};
