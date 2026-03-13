/* eslint-disable react/prop-types */
import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * Componente para mostrar el rol del usuario actual
 */
export const RoleBadge = ({ className = '' }) => {
  const { userRole, isAdmin } = usePermissions();

  const getRoleColor = () => {
    if (isAdmin) return 'bg-red-600';
    if (userRole === 'Supervisor') return 'bg-blue-600';
    if (userRole === 'Operativo') return 'bg-green-600';
    if (userRole === 'Coordinador') return 'bg-purple-600';
    return 'bg-gray-600';
  };

  const getRoleLabel = () => {
    if (isAdmin) return 'Administrador';
    return userRole || 'Sin rol';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getRoleColor()} ${className}`}>
      {getRoleLabel()}
    </span>
  );
};

/**
 * Componente para mostrar información del usuario con rol
 */
export const UserInfo = ({ className = '' }) => {
  return (
    <div className={`text-center ${className}`}>
      <RoleBadge />
    </div>
  );
};
