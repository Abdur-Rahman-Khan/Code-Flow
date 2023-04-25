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
let status = "none";


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
    if(utils.coins >= 30)
    {
        console.log("Inside Server.js testcodebackend", req.body);
        res.send({ message: 'Testing' });
        //check if ip is active with help of areYouActive route
        let knownIPsArray = utils.getIpAddresses();
        let count=0;
        // var ip = require("ip");
        let reqBody = JSON.parse(req.body);
        reqBody.IP = utils.myIP;

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
    } else {
        console.log("Insufficient credits for testing!");
    }
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

    axios.post(`http://${ip}:3000/receiveCodeStatus`, {ip: utils.myIP, result: result})
        .then(function (response) {
            console.log("Inside Server.js testcode", response.data);
        }).catch(function (error) {
            console.log(error);
        });



    // console.log(req.body);
    // console.log(JSON.parse(req.body).code);

});

let lastReqTime = new Date();
app.post('/receiveCodeStatus', (req, res) => {
    // const ip = req.ip;
    // const status = req.body.status;
    // const metadata = req.body.metadata;
    // console.log("Inside server.js receiveCode status",req.body);
    res.send({ message: 'Thanks for Testing' });
    let currReqTime = new Date();
    console.log("Inside server.js receiveCode status", currReqTime ,lastReqTime, currReqTime - lastReqTime);
    console.log(req.body);
    let parsedReq = req.body;
    if (currReqTime - lastReqTime > 10000) {
        console.log("Testing Timeout");
        utils.codeRunResponse = [[],[]];
        lastReqTime = currReqTime;
    }
    utils.codeRunResponse[0].push(parsedReq.ip);
    utils.codeRunResponse[1].push(parsedReq.result);
    console.log("Inside server.js receiveCode Length", utils.codeRunResponse[0].length);
    if (utils.codeRunResponse[0].length === 3) {
        // console.log("Inside server.js receiveCode status",utils.codeRunResponse);
        let consensus = utils.checkConsenus();
        if(consensus ==null){
            status= "noConsensus";
        }else if(consensus.status.includes("Passed")){
            status = "passed";
        }else{
            status = consensus.status;
        }
        console.log("Inside server.js receiveCode status Concensus", consensus);
        if (consensus[0] !== null) {
            let knownIPsArray = utils.getIpAddresses();
            transaction = {from: utils.myIP, to: consensus[1], reward: 10}
            knownIPsArray.forEach(ip => {
                axios.post(`http://${ip}/receiveReward`,transaction)
                .then(async (response) => {
                    console.log("Inside Server.js testcode", response.data);
                    if(response.data.message === 'Reward Received!') {
                        utils.coins -= 10;
                    }
                    await utils.writeTransaction(`transaction_${port}.txt`, transaction);
                }).catch(function (error) {
                    console.log(error);
                });
            })
        }
        utils.codeRunResponse = [[],[]];
    }
    
});
app.get('/getFrontendStatus', (req, res) => {
    res.send(`${status}`);
    // console.log("Inside server.js getFrontendStatus", utils.codeRunResponse);
});

app.post('/receiveReward', async (req,res) => {
    // console.log(req.body);
    let parsedReq = req.body;
    console.log(parsedReq)
    if(parsedReq.to.includes(utils.myIP)) {
        utils.coins += parsedReq.reward;
    }
    res.send({ message: "Reward Received!"});
    console.log(utils.coins);
    await utils.writeTransaction(`transaction_${port}.txt`, parsedReq);
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    utils.bootRun();
});
