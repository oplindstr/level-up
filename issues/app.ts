// Tested user-input with a simple express server. Everything worked with the user-input file as is.

import { VerySimpleDatabase, savePassword, saveAge } from './user-input';

import express from 'express'

import bodyParser from 'body-parser'

const app = express();
const PORT = 3000;

let db : VerySimpleDatabase
db = {
    insert: ((key : string, value : string | number) => {
        console.log(key)
        console.log(value)
        Promise.resolve()
    }),
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', (req, res)=>{
    savePassword(db, req.params)
    saveAge(db, req.params)
    res.status(200)
    res.send("OK")
});
  
app.listen(PORT, (error) =>{
    if(!error)
        console.log(`Server is Successfully Running, 
                   and App is listening on port `+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);