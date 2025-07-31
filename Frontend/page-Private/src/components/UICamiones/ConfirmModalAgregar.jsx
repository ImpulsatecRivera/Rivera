import Swal from 'sweetalert2';

const ValidationAlertAgregar = {
  show: (camposFaltantes = []) => {
    return Swal.fire({
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
  },

  showFileError: (message = 'Archivo no válido') => {
    return Swal.fire({
      title: 'Formato no válido',
      text: message,
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#f59e0b'
    });
  },

  showImageError: () => {
    return Swal.fire({
      title: 'Formato no válido',
      text: 'Por favor selecciona una imagen en formato JPG, PNG o GIF',
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#f59e0b'
    });
  },

  showSizeError: () => {
    return Swal.fire({
      title: 'Archivo muy grande',
      text: 'La imagen debe ser menor a 5MB',
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#f59e0b'
    });
  }
};

export default ValidationAlertAgregar;