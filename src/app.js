const express = require("express");
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const { getCatalog } = require("merchnow-api-node")
const PORT = process.env.PORT || 8080;
app.get('/:artist',cors(),async(req,res)=>{

    const results = await getCatalog(req.params.artist)
    console.log(results)
    await res.json(results)
})

app.listen(PORT,()=>{
    console.log(`app is listening on port ${PORT}`);
})