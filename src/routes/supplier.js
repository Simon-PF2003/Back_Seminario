const { Router } = require('express');
const router = Router();
const { verifyToken } = require('./user');
const jwt = require('jsonwebtoken');
const { deleteSupplierController } = require('../controllers/supplierController');

const Supplier = require('../models/supplier')

router.delete('/deleteSupplier/:supplierId', deleteSupplierController);

//ANDA
router.post('/createNewSupplier', async (req, res) => {
  const { cuit, businessName, address, phoneNumber, category } = req.body;
  const newSupplier = new Supplier({ cuit, businessName, address, phoneNumber, category });
  /*const supplierExists = await Supplier.findOne({ cuit: cuit });
  
  if (supplierExists) {
    return res.status(400).json({ message: 'El proveedor agregado ya existe' });
  }*/

  const token = jwt.sign({ _id: newSupplier._id }, 'secretKey');
  await newSupplier.save();
  res.status(200).json({ token });
});


//ANDA
/*router.get('/supplier/:supplierCuit',  async (req, res) => {
  const cuit = req.params.supplierCuit;
  const supplier = await Supplier.findOne({ cuit });

  if (!supplier) {
    return res.status(401).json({ cuitExists: false, message: "Proveedor no existe", data: null });
  }

  return res.json({ cuitExists: true, data: supplier });
});*/

  router.get('/supplier/:query', async(req,res)=>{
        const searchTerm = req.params.query;
        console.log('entramos');
        console.log(searchTerm);
  try {
    const isNumeric = !isNaN(Number(searchTerm));
    console.log(isNumeric)
    if (isNumeric) {
    // Búsqueda por cuit
    const supplier = await Supplier.findOne({ cuit: searchTerm }).exec();
      if (!supplier || supplier.length === 0) {
      console.log('No encontramos nada');
      return res.status(404).json({ message: 'Proveedores no encontrados' });
    }   
    console.log(supplier)
    return res.json(supplier);
  } else {
    // Búsqueda por businessName
    console.log('Buscamos por name');
    const suppliers = await Supplier.find({ businessName: { $regex: searchTerm, $options: 'i'}}).exec();
      if (!suppliers || suppliers.length === 0) {
      console.log('No encontramos nada');
      return res.status(404).json({ message: 'Proveedores no encontrados' });
    }   
    return res.status(200).json(suppliers);
    }  
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al buscar el proveedor', error: error });
  }

  });
  
router.patch('/updateDetails/details/:supId', async (req, res) => {
    const supId = req.params.supId;
    const { cuit, businessName, address, phoneNumber, category } = req.body;
    const updateDetails = { cuit, businessName, address, phoneNumber, category };
  
    try {
      const result = await Supplier.findByIdAndUpdate(supId, updateDetails, { new: true });
  
      if (!result) {
        return res.status(404).json({ error: 'Supplier no encontrado' });
      }
  
      res.json({ data: result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar el supplier' });
    }
  });

router.get('/getSuppliers', async (req, res) => {
  try {
    const proveedores = await Supplier.find(); 

    res.json(proveedores); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/deleteSuppliers', async (req, res)=> {
const{cuit} = req.body;

 try {
    const deletedSupplier = await Supplier.findOneAndDelete({ cuit });  

    if (!deletedSupplier) {
      return res.status(404).json({ error: 'Supplier no encontrado' });
    }

    res.json({ message: 'Supplier eliminado correctamente', supplier: deletedSupplier });
  } catch (error) {
    console.error('Error al eliminar el supplier:', error);
    res.status(500).json({ error: 'Error al eliminar el supplier' });
  }

});
module.exports = router;