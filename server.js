const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const axios = require('axios')

// import  * as utils  = require('./utils');
// import * as utils from './utils';
const utils = require('./utils/utility');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.text())
app.use(express.static('public'));

app.get('/', (req, res) => {
    // res.send('Hello, World!');
    res.send('index.html');
});

// GET route for /areYouActive
app.get('/areYouActive', (req, res) => {
    // Add the IP address of the requester to the list of known IPs
    // const ip = req.ip;

    const ipArr = utils.getIpAddresses();  
    // Send an immediate acknowledgement and a list of known IPs as an array
    res.send({ message: 'Acknowledged', knownIPs: ipArr });
});
    //fetch request for this route
    // fetch('http://localhost:3000/areYouActive')


app.post('/testCode',async (req, res) => {
    res.send({ message: 'Testing' });
    // console.log("Inside Server.js testcode",req.body);
    // console.log(req.body);
    // const ip = req.ip;
    parsedReq = JSON.parse(req.body);
    const result = await utils.testCode(parsedReq.code, parsedReq.language, parsedReq.problemId);
    // console.log("Inside Server.js testcode 1 " ,result);
    axios.post('http://localhost:3000/receiveCodeStatus', result)
    .then(function (response) {
      console.log("Inside Server.js testcode",response.data);
    });
    // console.log(req.body);
    // console.log(JSON.parse(req.body).code);
    
});
    


app.post('/receiveCodeStatus', (req, res) => {
    // const ip = req.ip;
    // const status = req.body.status;
    // const metadata = req.body.metadata;
    // console.log("Inside server.js receiveCode status",req.body);
    res.send({ message: 'Thanks for Testing' });

    utils.codeRunResponse.push(req.body);
    if(utils.codeRunResponse.length === 3) {
        // console.log("Inside server.js receiveCode status",utils.codeRunResponse);
        let consensus = utils.checkConsenus();
        console.log("Inside server.js receiveCode status Concensus",consensus);
        utils.codeRunResponse = [];
    }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  utils.bootRun();
});
