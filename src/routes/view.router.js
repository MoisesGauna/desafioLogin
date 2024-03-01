import { Router } from "express";
import { __dirname } from "../utils.js";
import ProductManager from "../dao/mongomanagers/productManagerMongo.js";
import CartManager from '../dao/mongomanagers/cartManagerMongo.js';
import { productsModel } from '../dao/models/products.model.js';
import { requireAuth, isAdmin } from "../config/authMiddleware.js"
import userManager from "../dao/mongomanagers/userManagerMongo.js";

const cmanager = new CartManager();
const pmanager = new ProductManager()
const usmanager = new userManager();

const router = Router()

// Middleware para pasar el objeto user a las vistas
const setUserInLocals = (req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
};

// Usar el middleware en todas las rutas
router.use(setUserInLocals);



router.get("/chat", requireAuth, (req, res) => {
    res.render("chat")
})

router.get('/', async (req, res) => {
    res.render('home')
})

router.get('/login', async (req, res) => {
    res.render('login')
})

router.get('/register', async (req, res) => {
    res.render('register')
})

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const newUser = await usmanager.regUser(username, email, password);

        req.session.user = newUser;

        console.log(newUser);
        res.redirect('/productos');
    } catch (error) {
        if (error.message === 'Email already in use') {
            // Manejar el caso en el que el correo electrónico ya está en uso
            console.log('El correo electrónico ya está en uso' , error);
            res.render('login', { error: 'El correo electrónico ya está en uso'});
        } else {
            // Manejar otros errores
            console.log('Error al registrar usuario:', error);
            res.render('login', { error: 'Error al registrar usuario' });
        }
    }
});





router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await usmanager.logInUser(username, password)

        req.session.user = user;

        res.redirect('/productos');
    } catch (error) {
        console.log('Invalid credentials', error);
        res.render('login', { error: 'Credenciales inválidas' });
    }
});


router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) res.send('Failed Logout')
        res.redirect('/')
    })
})


router.get("/productos", requireAuth, async (req, res) => {
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
        res.render('productos', products);
    } catch (error) {
        console.log('Error al leer los productos', error);
        res.status(500).json({ error: 'error al leer los productos' });
    }
});


router.get("/realtimeproducts", requireAuth, isAdmin, (req, res) => {
    res.render("realtimeproducts")
})



router.get("/cart", requireAuth, async (req, res) => {
    const productsInCart = await cmanager.getCartById("65c28522c1483aaada1fb25c")
    const productList = Object.values(productsInCart.products)
    res.render("partials/cart", { productList })
})

router.delete('/empty-cart', requireAuth, async (req, res) => {
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



router.delete('/delete-to-cart', requireAuth, async (req, res) => {
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

router.get("/:cid", requireAuth, async (req, res) => {
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


router.post('/add-to-cart', requireAuth, async (req, res) => {
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