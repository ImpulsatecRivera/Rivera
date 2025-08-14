import clienteModel from "../Models/Clientes.js"
import bcryptjs from "bcryptjs";

const clienteCon={}

clienteCon.get = async(req , res) => {
    try {
        const newCliente = await clienteModel.find()
    res.status(200).json(newCliente);
    } catch (error) {
          res.status(500).json({ message: "Error al obtener clientes", error: error.message });
    }
}

clienteCon.PutClientes = async(req,res) => {
    try {
        const{firtsName,lastName,email,idNumber,birthDate,password,phone,address}=req.body;

        const clienteActual = await clienteModel.findById(req.params.id);
        if(!clienteActual){
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        const datosActualizados = {};
        if(firtsName)datosActualizados.firtsName=firtsName;
        if(lastName)datosActualizados.lastName=lastName;
        if(idNumber)datosActualizados.idNumber=idNumber;
        if(email)datosActualizados.email=email;
        if(birthDate)datosActualizados.birthDate=birthDate;
        if(password)datosActualizados.password=password;
        if(phone)datosActualizados.phone=phone;
        if(address)datosActualizados.address=address;


        if(password){
            datosActualizados.password= await bcryptjs.hash(password,10);
        }

        const clienteActualizado = await clienteModel.findByIdAndUpdate(
            req.params.id,
            datosActualizados,
            {new:true,runValidators:true}
        )
          res.status(200).json({ 
            message: "Cliente actualizado correctamente",
            empleado: clienteActualizado
        });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar cliente", error: error.message });
    }
}


clienteCon.deleteClientes = async (req,res) =>{
    try {
        const deleteCliente = await clienteModel.findByIdAndDelete(req.params.id);
        if (!deleteCliente) {
         return res.status(404).json({ message: "Cliente no encontrado" });
        }
        res.status(200).json({ message: "Cliente eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el cliente", error: error.message });
    }
}

export default clienteCon;