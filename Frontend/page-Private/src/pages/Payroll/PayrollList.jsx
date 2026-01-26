// src/pages/Payroll/PayrollList.jsx
import React, { useEffect, useState } from 'react';
import { useTutorial } from '../../hooks/useTutorial';
import DataDetectionService from '../../services/DataDetectionService';

const PayrollList = () => {
  const [employees, setEmployees] = useState([]);
  const { startTutorial, hasCompleted } = useTutorial('payroll');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      setEmployees(data);
      
      // Limpiar caché si ahora hay datos
      if (data.length > 0) {
        DataDetectionService.clearModuleCache('payroll');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="payroll-container">
      {/* Botón manual de ayuda */}
      {!hasCompleted && (
        <button onClick={startTutorial} className="help-btn">
          ❓
        </button>
      )}

      {employees.length === 0 ? (
        <div className="payroll-welcome empty-state">
          <h2>No hay empleados registrados</h2>
          <p>Agrega empleados para comenzar</p>
        </div>
      ) : (
        <div className="payroll-list">
          {/* Lista de empleados */}
        </div>
      )}
    </div>
  );
};

export default PayrollList;