module.exports=function(io){
   io.on("connection",async(socket)=>{
    console.log("a user connected");
    socket.on("userConnet",async(data)=>{
         console.log("data",data)
         socket.emit("userConnet",data)
    })
   })
}