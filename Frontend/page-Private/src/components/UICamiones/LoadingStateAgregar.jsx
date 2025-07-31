import Swal from 'sweetalert2';

const LoadingAlertAgregar = {
  show: (title = 'Agregando camión...', text = 'Por favor espera mientras procesamos la información') => {
    Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  },

  close: () => {
    Swal.close();
  }
};

export default LoadingAlertAgregar;