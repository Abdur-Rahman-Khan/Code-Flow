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

app.post('/testCodeBackend', (req, res) => {
    console.log("Inside Server.js testcodebackend", req.body);
    res.send({ message: 'Testing' });
    //check if ip is active with help of areYouActive route
    let knownIPsArray = utils.getIpAddresses();
    let count=0;
    // var ip = require("ip");
    console.dir ( ip.address() );
    let myIP = ip.address();
    let reqBody = JSON.parse(req.body);
    reqBody.IP = myIP;

    reqBody = JSON.stringify(reqBody);
    // console.log(reqBody);

    // console.log("Inside Server.js testcodebackend", knownIPsArray);
    knownIPsArray.forEach(ip => {
        axios.get(`http://${ip}/areYouActive`).then(function (response) {
            console.log(response.data);
            console.log(response.data.knownIPs);
            if(count<3){
                utils.makeTestCodeRequest(ip, reqBody);
                count++;
            }
        }).catch(function (error) {
            console.log(error);
            console.log(ip,"error ip not active");
        });
    });
    //make request to testcode route as test/plain with 
    // utils.makeTestCodeRequest(`localhost:3000`, req.body);
});

app.post('/testCode', async (req, res) => {
    res.send({ message: 'Testing' });
    parsedReq = JSON.parse(req.body);
    // console.log("Inside Server.js testcode",req.body);
    // console.log(req.body);
    const ip = parsedReq.IP;
    console.log("Inside Server.js testcode",ip);
    //check port of incoming req
    console.log(req.socket.localPort);
    console.log(req.socket.remotePort);
    let ipPort = ip+":"+req.socket.remotePort;
    console.log(ipPort);
    // console.log("Inside Server.js testcode",req.body);
    
    const result = await utils.testCode(parsedReq.code, parsedReq.language, parsedReq.problemId);
    console.log("Inside Server.js testcode 1 ", result);
    // //for each ip in utils.knownIps set make this request

    axios.post(`http://${ip}:3000/receiveCodeStatus`, result)
        .then(function (response) {
            console.log("Inside Server.js testcode", response.data);
        }).catch(function (error) {
            console.log(error);
        });



    // console.log(req.body);
    // console.log(JSON.parse(req.body).code);

});


lastReqTime = new Date();
app.post('/receiveCodeStatus', (req, res) => {
    // const ip = req.ip;
    // const status = req.body.status;
    // const metadata = req.body.metadata;
    // console.log("Inside server.js receiveCode status",req.body);
    res.send({ message: 'Thanks for Testing' });
    currReqTime = new Date();
    console.log("Inside server.js receiveCode status", currReqTime ,lastReqTime, currReqTime - lastReqTime);
    console.log(req.body);
    if (currReqTime - lastReqTime > 20000) {
        utils.codeRunResponse = [];
        lastReqTime = currReqTime;
    }
    utils.codeRunResponse.push(req.body);
    console.log("Inside server.js receiveCode Length", utils.codeRunResponse.length);
    if (utils.codeRunResponse.length === 3) {
        // console.log("Inside server.js receiveCode status",utils.codeRunResponse);
        let consensus = utils.checkConsenus();
        console.log("Inside server.js receiveCode status Concensus", consensus);
        utils.codeRunResponse = [];
    }
});

app.post('/receiveReward', (req,res) => {
    parsedReq = JSON.parse(req.body);
    if(parsedReq.ip === utils.myIP) {
        utils.coins += parsedReq.reward;
    }
    res.send({ message: "Reward Received!"});
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    utils.bootRun();
});
