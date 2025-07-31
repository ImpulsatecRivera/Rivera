import Swal from 'sweetalert2';

export const showSuccessAlert = (onConfirm) => {
  Swal.fire({
    title: '¡Empleado agregado con éxito!',
    text: 'Empleado agregado correctamente',
    icon: 'success',
    confirmButtonText: 'Continuar',
    confirmButtonColor: '#5D9646',
    allowOutsideClick: false,
    customClass: {
      popup: 'animated bounceIn'
    }
  }).then((result) => {
    if (result.isConfirmed && onConfirm) {
      onConfirm();
    }
  });
};

export const showErrorAlert = (message) => {
  Swal.fire({
    title: 'Error al agregar empleado',
    text: message || 'Hubo un error al procesar la solicitud',
    icon: 'error',
    confirmButtonText: 'Intentar de nuevo',
    confirmButtonColor: '#ef4444',
    allowOutsideClick: false,
    customClass: {
      popup: 'animated shakeX'
    }
  });
};

export const showLoadingAlert = () => {
  Swal.fire({
    title: 'Agregando empleado...',
    text: 'Por favor espera mientras procesamos la información',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

export const showValidationAlert = (camposFaltantes) => {
  Swal.fire({
    title: '⚠️ Formulario incompleto',
    html: `
      <p style="margin-bottom: 15px;">Los siguientes campos son obligatorios:</p>
      <ul style="text-align: left; color: #dc2626; font-weight: 500;">
        ${camposFaltantes.map(campo => `<li>• ${campo}</li>`).join('')}
      </ul>
    `,
    icon: 'warning',
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#f59e0b',
    allowOutsideClick: false,
    customClass: {
      popup: 'animated pulse'
    }
  });
};