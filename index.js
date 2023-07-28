const express = require("express");
const uuid = require("uuid");
const fs = require("fs");

const app = express();
app.use(express.json());
const port = 3000;

let orders = [];

const readDataFromFile = ()=>{
    try {
        const data = fs.readFileSync('./db.json', 'utf8');
        orders = JSON.parse(data);
        return JSON.parse(data);
      } catch (err) {
        // Se o arquivo não existir ou ocorrer algum erro na leitura, retorna um array vazio.
        return [];
      }
}

function writeDataToFile() {
    const dataToWrite = JSON.stringify(orders, null, 2);
    fs.writeFileSync('db.json', dataToWrite, 'utf8');
  }

  readDataFromFile()

const checkOrderId = (request, response, next) => {
    const { id } = request.params;

    if (!id ) {
        return next();
    }
    const index = orders.findIndex(order => order.id === id);
    console.log(id)
    console.log(index)
    if (index < 0) {
        return response.status(404).json({ message: "Not found" });
    }
    request.orderId = id;
    request.indexOrder = index;
    
    console.log(request.method, request.url)
    next();
}

app.get("/orders",checkOrderId, (request, response) => {
    const data = readDataFromFile();
    
    return response.json(data);
})


app.post("/orders", checkOrderId, (request, response) => {
    const { order, clientName, price } = request.body;
    const orderData = { id: uuid.v4(), order, clientName, price, status: "Em preparação" };
    orders.push(orderData)
    writeDataToFile();
    return response.json(orderData)
})

app.put("/orders/:id", checkOrderId, (request, response)=>{
    const id = request.orderId;
    const index = request.indexOrder;
    console.log(id)
    console.log(index)
    const { order, clientName, price, status } = request.body;
    const update = {id, order, clientName, price, status}
    orders[index] = update;
    writeDataToFile();
    return response.status(201).json(update)

})

app.delete("/orders/:id", checkOrderId, (request, response)=>{

    const index = request.indexOrder;

    orders.splice(index, 1);
    writeDataToFile();
    return response.status(204).json();
    
})

app.patch("/orders/:id", checkOrderId, (request, response)=>{
    const { status }= request.body;
    const index = request.indexOrder;
    orders[index].status = status;
    writeDataToFile();
    return response.json(orders[index]);
})

app.listen(port, () => {
    console.log(`✅ Server is running on port ${port} 😁`)

})
