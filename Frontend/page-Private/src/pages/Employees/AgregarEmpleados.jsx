import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Calendar, ChevronLeft, ChevronRight, ChevronDown, Upload, X } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AddEmployeeForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    dui: '',
    birthDate: '',
    password: '',
    phone: '',
    address: '',
    img: null
  });

  // Aquí podrías agregar useEffect si es necesario, por ejemplo, para validaciones o cargar datos

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'img') {
      setFormData({ ...formData, img: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formPayload = new FormData();
      for (const key in formData) {
        formPayload.append(key, formData[key]);
      }

      const response = await axios.post('/api/employees', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Swal.fire('Éxito', 'Empleado agregado correctamente', 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Ocurrió un error al agregar el empleado', 'error');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Agregar Empleado</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Apellido"
            value={formData.lastName}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="dui"
            placeholder="DUI"
            value={formData.dui}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="phone"
            placeholder="Teléfono"
            value={formData.phone}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="address"
            placeholder="Dirección"
            value={formData.address}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        <div className="mt-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Imagen del empleado</label>
          <input
            type="file"
            name="img"
            accept="image/*"
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Guardar
        </button>
      </form>
    </div>
  );
};

export default AddEmployeeForm;
