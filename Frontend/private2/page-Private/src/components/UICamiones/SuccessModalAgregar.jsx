import Swal from 'sweetalert2';

const SuccessAlertAgregar = {
  show: ({
    title = '¡Camión agregado con éxito!',
    text = 'Camión agregado correctamente',
    confirmButtonText = 'Continuar',
    confirmButtonColor = '#5D9646',
    onConfirm
  }) => {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonText,
      confirmButtonColor,
      allowOutsideClick: false,
      customClass: {
        popup: 'animated bounceIn'
      }
    }).then((result) => {
      if (result.isConfirmed && onConfirm) {
        onConfirm();
      }
      return result;
    });
  }
};

export default SuccessAlertAgregar;