import clienteModel from "../Models/Clientes.js"

const clienteCon={}

clienteCon.get = async(req , res) => {
    const newCliente = await clienteModel.find()
    res.status(200).json(newCliente);
}

export default clienteCon;