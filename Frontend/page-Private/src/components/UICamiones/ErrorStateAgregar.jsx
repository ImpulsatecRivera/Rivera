import Swal from 'sweetalert2';

const ErrorAlertAgregar = {
  show: ({
    title = 'Error al agregar camión',
    text = 'Ocurrió un error inesperado',
    confirmButtonText = 'Intentar de nuevo',
    confirmButtonColor = '#ef4444',
    onConfirm
  }) => {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText,
      confirmButtonColor,
      allowOutsideClick: false,
      customClass: {
        popup: 'animated shakeX'
      }
    }).then((result) => {
      if (result.isConfirmed && onConfirm) {
        onConfirm();
      }
      return result;
    });
  }
};

export default ErrorAlertAgregar;