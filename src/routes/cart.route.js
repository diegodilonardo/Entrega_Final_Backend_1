import { Router } from 'express';
import { CartManager } from '../Dao/Cart.js';
import { cartModel } from '../Dao/models/Cart.model.js';

const router = Router();
const cartsManager = new CartManager('./src/data/databasecarts.json');

router.post('/', async (req, res) => {
    const newCart = await cartModel.create({
        products: []
    })

    res.status(201).json({ message: 'Se guardo la informacion con exito', cart: newCart })
});

router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
	
    const cartFinded = await cartModel.findById(cid).populate('products.product');

    const status = cartFinded ? 200 : 404;

    res.status(status).json({ productList: cartFinded?.products });
});

router.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body

    const cartFinded = await cartModel.findById(cid).lean();
    if(!cartFinded) res.status(404).json({ message: 'error' });

    const newCart = {
        ...cartFinded,
        products
    }
    const cartUpdated = await cartModel.findByIdAndUpdate(cid,newCart, {
        new: true,
    }).populate('products.product')

    res.status(201).json({ message: 'Producto Modificado con Exito', cart: cartUpdated})

});

router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;

    const cartFinded = await cartModel.findById(cid).lean();
    if(!cartFinded) res.status(404).json({ message: 'error' });

    const newCart = {
        ...cartFinded,
        products: []
    }
    const cartUpdated = await cartModel.findByIdAndUpdate(cid,newCart, {
        new: true,
    })

    res.status(201).json({ message: 'Producto Eliminado con Exito', cart: cartUpdated})

});

router.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;

    const cartFinded = await cartModel.findById(cid);
    if(!cartFinded) res.status(404).json({ message: 'error' });

    const indexProd = cartFinded.products.findIndex(prod => prod.product.toString() === pid);
    if(indexProd === -1){
        cartFinded.products.push({ product: pid, quantity: 1 })
    } else {
        cartFinded.products[indexProd] = { product: cartFinded.products[indexProd].product, quantity: cartFinded.products[indexProd].quantity + 1 }
    }
    const cartUpdated = await cartModel.findByIdAndUpdate(cid,cartFinded, {
        new: true,
    }).populate('products.product')

    res.status(201).json({ message: 'Producto agregado con exito', cart: cartUpdated})

});

router.put('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cartFinded = await cartModel.findById(cid).lean();
    if(!cartFinded) res.status(404).json({ message: 'error' });

    const indexProd = cartFinded.products.findIndex(prod => prod.product.toString() === pid);
    
    cartFinded.products[indexProd] = { ...cartFinded.products[indexProd], quantity }
    
    const cartUpdated = await cartModel.findByIdAndUpdate(cid,cartFinded, {
        new: true,
    }).populate('products.product')

    res.status(201).json({ message: 'Cantidad de Producto Modificada', cart: cartUpdated })

});

router.delete('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;

    const cartFinded = await cartModel.findById(cid).lean();
    if(!cartFinded) res.status(404).json({ message: 'error' });

    const cartFiltered = {
        ...cartFinded,
        products:  cartFinded.products.filter(prod => prod.product.toString() !== pid)
    }

    const cartUpdated = await cartModel.findByIdAndUpdate(cid,cartFiltered, {
        new: true,
    }).populate('products.product')

    res.status(201).json({ message: 'Producto Eliminado', cart: cartUpdated})
});

export default router
