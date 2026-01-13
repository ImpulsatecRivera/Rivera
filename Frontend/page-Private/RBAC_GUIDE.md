# Sistema RBAC en Frontend

## Resumen de Cambios

Se ha implementado un sistema de Control de Acceso Basado en Roles (RBAC) completo en el frontend para proteger acciones según el rol del usuario.

## Componentes y Hooks Disponibles

### 1. Hook `usePermissions()` 
Proporciona acceso a toda la información de permisos del usuario.

**Ubicación:** `src/hooks/usePermissions.js`

**Uso:**
```jsx
import { usePermissions } from '../hooks/usePermissions';

function MyComponent() {
  const { 
    userRole,           // 'Operativo' | 'Supervisor' | null
    isAdmin,            // boolean
    isSupervisor,       // boolean
    isOperativo,        // boolean
    canCreate,          // function() - Operativo, Supervisor, Admin
    canEdit,            // function() - Supervisor, Admin
    canDelete,          // function() - Admin only
    canViewReports,     // function() - Operativo, Supervisor, Admin
    hasRole,            // function(roles) - Verificar role específico
  } = usePermissions();

  if (canDelete()) {
    return <button>Eliminar Registro</button>;
  }
}
```

### 2. Componente `<ProtectedAction>`
Muestra u oculta elementos basado en permisos (perfecto para botones, opciones, etc).

**Ubicación:** `src/components/Auth/ProtectedAction.jsx`

**Uso:**
```jsx
import { ProtectedAction } from '../components/Auth/ProtectedAction';

function DataTable() {
  return (
    <tr>
      <td>Datos</td>
      <td>
        {/* Botón de editar - solo Supervisor y Admin */}
        <ProtectedAction action="edit">
          <button className="btn-edit">Editar</button>
        </ProtectedAction>

        {/* Botón de eliminar - solo Admin */}
        <ProtectedAction action="delete">
          <button className="btn-delete">Eliminar</button>
        </ProtectedAction>

        {/* Con fallback personalizado */}
        <ProtectedAction 
          action="delete"
          fallback={<span className="text-gray-400 text-sm">Sin permisos</span>}
        >
          <button>Eliminar</button>
        </ProtectedAction>

        {/* Con rol custom */}
        <ProtectedAction 
          action="custom"
          requiredRole={['Supervisor', 'Operativo']}
        >
          <button>Acción especial</button>
        </ProtectedAction>
      </td>
    </tr>
  );
}
```

### 3. Componente `<DisableableButton>`
Similar a ProtectedAction pero deshabilita el botón en lugar de ocultarlo.

**Uso:**
```jsx
import { DisableableButton } from '../components/Auth/ProtectedAction';

function MyComponent() {
  return (
    <>
      <DisableableButton 
        action="edit"
        onClick={handleEdit}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Editar (deshabilitado si no tienes permisos)
      </DisableableButton>

      <DisableableButton 
        action="delete"
        onClick={handleDelete}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Eliminar (deshabilitado si no eres admin)
      </DisableableButton>
    </>
  );
}
```

### 4. Componente `<RoleBadge>`
Muestra el rol actual del usuario en la UI.

**Ubicación:** `src/components/Auth/RoleBadge.jsx`

**Uso:**
```jsx
import { RoleBadge, UserInfo } from '../components/Auth/RoleBadge';

function NavBar() {
  return (
    <nav>
      {/* Mostrar solo el badge */}
      <RoleBadge className="ml-auto" />

      {/* O mostrar información del usuario con rol */}
      <UserInfo className="mr-4" />
    </nav>
  );
}
```

## Context Actualizado

Se actualizó `AuthContext.jsx` para incluir:

1. **Guardado de Rol:** El `rol` se almacena en localStorage automáticamente
2. **Métodos de Verificación:**
   - `hasRole(requiredRoles)` - Verifica si el usuario tiene un rol específico
   - `canCreate()` - Operativo, Supervisor, Admin
   - `canEdit()` - Supervisor, Admin
   - `canDelete()` - Admin only
   - `canViewReports()` - Operativo, Supervisor, Admin

3. **Estado de Rol:** Nueva propiedad `userRole` en el provider

## Guía de Implementación en Componentes Existentes

### Ejemplo: Tabla de Empleados con Permisos

```jsx
import { usePermissions } from '../hooks/usePermissions';
import { ProtectedAction } from '../components/Auth/ProtectedAction';

function EmployeeTable({ empleados }) {
  const { canEdit, canDelete } = usePermissions();

  return (
    <table>
      <tbody>
        {empleados.map(emp => (
          <tr key={emp._id}>
            <td>{emp.name}</td>
            <td>{emp.email}</td>
            <td>
              {/* Botón editar - solo Supervisor y Admin */}
              <ProtectedAction action="edit">
                <button onClick={() => handleEdit(emp)}>✏️</button>
              </ProtectedAction>

              {/* Botón eliminar - solo Admin */}
              <ProtectedAction action="delete">
                <button onClick={() => handleDelete(emp._id)} className="text-red-500">
                  🗑️
                </button>
              </ProtectedAction>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Ejemplo: Barra de Acciones con Permisos

```jsx
import { ProtectedAction } from '../components/Auth/ProtectedAction';
import { RoleBadge } from '../components/Auth/RoleBadge';

function ActionBar() {
  return (
    <div className="flex justify-between items-center">
      <h1>Panel de Control</h1>

      {/* Mostrar rol del usuario */}
      <RoleBadge />

      {/* Botones protegidos */}
      <div className="space-x-2">
        {/* Crear - Operativo, Supervisor, Admin */}
        <ProtectedAction action="create">
          <button className="btn-primary">+ Nuevo</button>
        </ProtectedAction>

        {/* Configuración - Solo Admin */}
        <ProtectedAction action="custom" requiredRole="Administrador">
          <button className="btn-secondary">⚙️ Configuración</button>
        </ProtectedAction>
      </div>
    </div>
  );
}
```

## Modelo de Permisos

| Acción | Operativo | Supervisor | Admin |
|--------|-----------|-----------|-------|
| Ver (GET) | ✅ | ✅ | ✅ |
| Crear (POST) | ✅ | ✅ | ✅ |
| Editar (PUT) | ❌ | ✅ | ✅ |
| Eliminar (DELETE) | ❌ | ❌ | ✅ |
| Ver Reportes | ✅ | ✅ | ✅ |

## Manejo de Errores 403

El backend retorna 403 cuando un usuario intenta acceder a una acción sin permisos. El frontend debe:

1. **Capturar el error 403 en peticiones:**
```jsx
try {
  await api.delete(`/empleados/${id}`);
} catch (error) {
  if (error.response?.status === 403) {
    toast.error('No tienes permisos para eliminar este registro');
    // Redirigir o mostrar mensaje de acceso denegado
  }
}
```

2. **Usar ProtectedAction para prevenir el intento:**
```jsx
<ProtectedAction action="delete">
  <button onClick={() => deleteEmployee(id)}>Eliminar</button>
</ProtectedAction>
```

## Testing del Sistema

### Test 1: Verificar rol guardado en localStorage
```js
// Después del login, en la consola:
localStorage.getItem('userRole')
// Debe retornar: "Operativo", "Supervisor", o null para Admin
```

### Test 2: Verificar permisos en componente
```jsx
function TestPermissions() {
  const { canDelete, canEdit, isAdmin } = usePermissions();
  
  return (
    <div>
      <p>Admin: {isAdmin ? 'Sí' : 'No'}</p>
      <p>Puede editar: {canEdit() ? 'Sí' : 'No'}</p>
      <p>Puede eliminar: {canDelete() ? 'Sí' : 'No'}</p>
    </div>
  );
}
```

### Test 3: Botones deshabilitados
Los botones con `DisableableButton` deben:
- Estar habilitados si el usuario tiene permisos
- Estar deshabilitados (opacidad 50%) si no los tiene
- Mostrar tooltip "No tienes permisos para esta acción"

## Próximos Pasos

1. ✅ Backend RBAC - Completado
2. ✅ Frontend Context - Completado
3. ⏳ Aplicar `<ProtectedAction>` en componentes existentes
4. ⏳ Agregar manejo de errores 403
5. ⏳ Testing de permisos en cada página

## FAQ

**P: ¿Qué pasa si el usuario no tiene rol asignado?**
R: El rol será `null` y solo verá "Sin rol" en el badge. Ninguna acción de crear/editar/eliminar funcionará.

**P: ¿Cómo verifico si el usuario es Admin?**
R: Usa `isAdmin` del hook: `const { isAdmin } = usePermissions();`

**P: ¿Puedo ocultar navegación según rol?**
R: Sí, usa `usePermissions()` en tu NavBar:
```jsx
<ProtectedAction action="custom" requiredRole="Administrador">
  <NavLink to="/admin">Administración</NavLink>
</ProtectedAction>
```

**P: ¿El rol persiste después de recargar la página?**
R: Sí, se guarda en localStorage y se restaura automáticamente.
