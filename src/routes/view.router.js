import { Router } from "express";
import { __dirname } from "../utils.js";
import ProductManager from "../dao/mongomanagers/productManagerMongo.js";
import CartManager from '../dao/mongomanagers/cartManagerMongo.js';
import { productsModel } from '../dao/models/products.model.js';


const cmanager = new CartManager();
const pmanager = new ProductManager()

const router = Router()


router.get("/chat", (req, res) => {
    res.render("chat")
})


router.get("/", async (req, res) => {
    try {
        let pageNum = parseInt(req.query.page) || 1;
        let itemsPorPage = parseInt(req.query.limit) || 10;
        let sortByPrice = req.query.sort === 'asc' ? 'price' : req.query.sort === 'desc' ? '-price' : null;
        let category = req.query.category ? { category: req.query.category } : {};
        

        const query = {};

        if (sortByPrice) {
            query.sort = sortByPrice;
        }

        const products = await productsModel.paginate(category, { page: pageNum, limit: itemsPorPage, sort: query.sort, lean: true });

        products.prevLink = products.hasPrevPage ? `/?limit=${itemsPorPage}&page=${products.prevPage}` : '';
        products.nextLink = products.hasNextPage ? `/?limit=${itemsPorPage}&page=${products.nextPage}` : '';

        products.page = products.page;
        products.totalPages = products.totalPages;
        console.log(products)
        res.render('home', products);
    } catch (error) {
        console.log('Error al leer los productos', error);
        res.status(500).json({ error: 'error al leer los productos' });
    }
});


router.get("/realtimeproducts", (req, res) => {
    res.render("realtimeproducts")
})



router.get("/cart", async (req, res) => {
    const productsInCart = await cmanager.getCartById("65c28522c1483aaada1fb25c")
    const productList = Object.values(productsInCart.products)
    res.render("partials/cart", { productList })
})

router.delete('/empty-cart', async (req, res) => {
    try {
        // Lógica para vaciar completamente el carrito
        const cartId = "65c28522c1483aaada1fb25c"; // ID del carrito a vaciar

        const cart = await cmanager.removeallProductFromCart(cartId);

        res.status(200).json({ message: 'Carrito vaciado exitosamente' });
    } catch (error) {
        console.error('Error al vaciar el carrito:', error);
        res.status(500).json({ error: 'Error al vaciar el carrito' });
    }
});



router.delete('/delete-to-cart', async (req, res) => {
    try {
        const { productId } = req.body;

        const removeCartProduct = await cmanager.removeProductFromCart("65c28522c1483aaada1fb25c", productId);

        // En lugar de enviar un script con alert y redirección, puedes enviar un mensaje JSON de éxito
        res.json({ success: true, message: 'Producto eliminado del carrito' });
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ message: 'Error al agregar producto al carrito' });
    }
});

router.get("/:cid", async (req, res) => {
    try {
        const id = req.params.cid
        const result = await productsModel.findById(id).lean().exec()

        if (result === null) {
            return res.status(404).json({ status: 'error', error: 'product not found' })
        }
        res.render('partials/productDetail', result)
    } catch (error) {
        res.status(500).json({ error: 'error al leer el producto' })
    }
})


router.post('/add-to-cart', async (req, res) => {
    try {
        const { productId, quantity } = req.body; // Obtener la cantidad del cuerpo de la solicitud

        const cart = await cmanager.getCartById("65c28522c1483aaada1fb25c");

        if (productId) {
            const id = productId;
            const productDetails = await pmanager.getProductById(productId);
            const addedProduct = await cmanager.addProductInCart("65c28522c1483aaada1fb25c", productDetails, id, quantity); // Pasar la cantidad al método addProductInCart
        }

        res.json({ success: true, message: 'Producto agregado al carrito' });
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ message: 'Error al agregar producto al carrito' });
    }
});






export default router