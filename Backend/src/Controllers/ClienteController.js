import clienteModel from "../Models/Clientes.js"

const clienteCon={}

clienteCon.get = async(req , res) => {
    try {
        const newCliente = await clienteModel.find()
    res.status(200).json(newCliente);
    } catch (error) {
          res.status(500).json({ message: "Error al obtener clientes", error: error.message });
    }
}

export default clienteCon;