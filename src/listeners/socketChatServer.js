import MessagesManager from "../dao/mongomanagers/messageMongoManager.js";
const mm= new MessagesManager()

const socketChatServer=(socketServer)=>{
socketServer.on('connection',async(socket)=>{
    console.log("conectado usuario con id: " + socket.id)


     // Emitir el mensaje a todos los clientes conectados
     socketServer.emit("chat2", await mm.getMessages());

    socket.on("mensaje", async (info) => {
        await mm.createMessage(info);
        // Emitir el mensaje a todos los clientes conectados
         socketServer.emit("chat", await mm.getMessages());

      })
      
      socket.on("nuevousuario",(usuario)=>{
        socket.broadcast.emit("broadcast",usuario);

       })

       socket.on("clearchat", async () => {
        // Borrar todos los mensajes utilizando el MessagesManager
        await mm.deleteAllMessages();
        // // Emitir a todos los clientes para notificar que el chat ha sido vaciado
        socketServer.emit("chatCleared");
    });
})

};
export default socketChatServer;