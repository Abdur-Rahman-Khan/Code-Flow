const express = require('express');
// const bodyParser = require('body-parser');
const app = express();
// import  * as utils  = require('./utils');
// import * as utils from './utils';
const utils = require('./utils/utility');

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.use(express.text())
app.use(express.static('public'));

app.get('/', (req, res) => {
//   res.send('Hello, World!');
// res.send('index.html');
res.sendFile(__dirname + '/index.html');
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


app.post('/testCode', (req, res) => {
    // const ip = req.ip;
    // const code = req.body.code;
    // const language = req.body.language;
    // const result = utils.testCode(code, language);
    // console.log(req.body);
    console.log(req.body);
    res.send({ message: 'Testing' });
});
    


app.post('/receiveCodeStatus', (req, res) => {
    // const ip = req.ip;
    // const status = req.body.status;
    // const metadata = req.body.metadata;
    res.send({ message: 'Thanks for Testing' });
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  utils.bootRun();
});
