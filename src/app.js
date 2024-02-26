import express from "express"
import viewRouter from "./routes/view.router.js"
import productRouter from "./routes/products.router.js"
import cartRouter from "./routes/carts.router.js"
import {__dirname} from "./utils.js"
import handlebars from "express-handlebars"
import {Server} from "socket.io"


import connectToDB from "./config/configServer.js"

//socketservers
import socketProducts from "./listeners/socketProducts.js"
import socketChatServer from "./listeners/socketChatServer.js"
const app=express()
const PORT=process.env.PORT||8080;


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(__dirname+"/public"))

app.engine("handlebars",handlebars.engine())
app.set('view engine', 'handlebars');
app.set("views",__dirname+"/views")



app.use("/api",productRouter)
app.use("/api",cartRouter)
app.use("/",viewRouter)

const httpServer = app.listen(PORT, () => {
    try {
        console.log(`Listening to the port ${PORT}\nAcceder a:`);
        console.log(`\t1). http://localhost:${PORT}/`)
        console.log(`\t2). http://localhost:${PORT}/realtimeproducts`);
        console.log(`\t3). http://localhost:${PORT}/cart`);

    }
    catch (err) {
        console.log(err);
    }
});
connectToDB()
const socketServer= new Server(httpServer)


socketProducts(socketServer)
socketChatServer(socketServer)