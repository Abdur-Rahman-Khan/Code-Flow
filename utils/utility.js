const { exec } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');
const os = require('os');
const axios = require('axios')
const ip = require("ip");
const { log } = require('console');
const myIP = ip.address();
let coins = 50;

//get operating system name in string
const osType=os.type();
console.log("OS Type",osType);
let codeRunResponse = [[],[]];

const lang_data = {
  'C': {
    'extension':'c',
    'compile_cmd': 'gcc',
    'run_cmd': ''},
  'C++': {
    'extension':'cpp',
    'compile_cmd': 'g++',
    'run_cmd': ''},
  'Python': {
    'extension':'py', 
    'compile_cmd': '',
    'run_cmd':'python'}
};

function getIpAddresses() {
  const knownIPs = [...new Set(fs.readFileSync('./files/loips.txt').toString().split(",").map((knownIp) => knownIp.trim()))];
  return knownIPs;
  // return Array.from(knownIPs);
}

function bootRun(){
    console.log("bootRun");
    //populate knownIPs from reading file
    //other startup functions
}

function saveCode(fileName, code, language) {
  return new Promise((resolve,reject) => {
    fs.writeFile(`${fileName}.${lang_data[language].extension}`, code, (error) => {
    if (error) {
      // console.error(`Error saving file: ${error}`);
      reject(error);
    }

    // console.log('File saved successfully');
    resolve();
  })});

}

function compileCode(fileName, language) {
  if(lang_data[language].compile_cmd === '') {
    return {status:1, compiledFile: `${fileName}.${lang_data[language].extension}`};
  }
  return new Promise((resolve,reject) => {
    exec(`${lang_data[language].compile_cmd} ${fileName}.${lang_data[language].extension}`, (error, stdout, stderr) => {
    if (error) {
      // console.log(`Exec Error: ${error}`);
      resolve({status:0, compiledFile: ''});
    }

    if (stderr) {
      // console.log(`Compilation Error: ${error}`);
      resolve({status:0, compiledFile: ''});
    }

    // console.log(`Compilation success: ${stdout}`);
    resolve({status:1, compiledFile: (osType.includes('Windows')?'a.exe':'a.out')});
  })});
}

function runCode(code_exe, test_file, language='C') {
  console.log(`Inside Utility runCode`);
  return new Promise((resolve,reject) => {
    let execString="";
    if(osType.includes('Windows')) {
      execString=`${lang_data[language].run_cmd} ${code_exe} ${test_file}`;
    } else {
      execString=`${lang_data[language].run_cmd} ./${code_exe} ${test_file}`;
    }
    // exec(`${lang_data[language].run_cmd} ${code_exe} ${test_file}`,{'timeout': 2000}, (error, stdout, stderr) => {
    exec(`${execString}`,{'timeout': 2000}, (error, stdout, stderr) => {
    // console.log(`${lang_data[language].run_cmd} ${code_exe} ${test_file}`);
    if (error) {
      console.error(`Exec error: ${error}`);
      return;
    }

    if (stderr) {
      console.error(`Execution error: ${stderr}`);
      resolve(stderr)
    }

    console.log(`Execution success: ${stdout}`)
    resolve(stdout);
  })});
}
async function isCorrectOutput(problemId, given_ans, testFile) {
  if(osType.includes('Windows')) 
    correct_ans = await runCode(`Problems\\P${problemId}\\a.exe`, testFile);
  else
    correct_ans = await runCode(`Problems/P${problemId}/a.out`, testFile);
    console.log("Inside Utility isCorrectOutput",correct_ans)
    console.log(`Given ans: ${given_ans}`);
  if(given_ans === correct_ans) {
    return true
  }
  return false;
}

async function runAllTests(problemId, code_exe, language) {
  console.log(`Inside Utility runAllTests`);
  test_hashes = [];
  for(let i=0; i<3; i++) {
      if(osType.includes('Windows'))
        testFile = `Problems\\P${problemId}\\test${i}.txt`
      else
        testFile = `Problems/P${problemId}/test${i}.txt`
      given_ans = await runCode(code_exe, testFile, language);
      var hash = crypto.createHash('md5').update(given_ans).digest('hex');
      test_hashes.push(hash);
      if(!await isCorrectOutput(problemId, given_ans, testFile)) {
        console.log("Done testing utility runAllTests Inside Error");
        return { 'status': `Test case ${i} Failed!`, 'meta_data': test_hashes};
      }
  }
  console.log("Done testing utility runAllTests");
  return { 'status': 'All Test Cases Passed!', 'meta_data': test_hashes};
}

async function testCode(code, language, problemId) {
  // console.log(`Testing code: ${code}`);

  // console.log(`Inside Utilty testcode Language: ${language}`);
  // console.log(`Inside Utilty testcode Problem Id: ${problemId}`);
  //return object with result and error message
  // Save code to file
  fileName = 'code';
  await saveCode(fileName, code, language);
  compiled = await compileCode(fileName, language);
  console.log(`Inside Utility testcode`,compiled)
  if(!compiled.status) {
      return { result: 'Compilation Error', test_hashes: []};
  }
  console.log("Done testing utility testCode");
  console.log("Inside Utility testCode",compiled);
  return await runAllTests(problemId, compiled.compiledFile, language);
}
function checkConsenus(responses) {
  console.log("Inside utility checkConsenus");
  console.log(responses[1].length);
  console.log(responses);
  let majority = Math.ceil(responses[1].length/2);
  let count = 0;
  let majorityElement = null;
  console.log("Done testing utility checkConsenus",[majorityElement]);
  for(let i=0; i<responses[1].length; i++) {
    //compare majorityElement with current element as object
    if(JSON.stringify(responses[1][i]) == JSON.stringify(majorityElement)) {
      count++;
    } else if(count == 0) {
      majorityElement = responses[1][i];
      count = 1;
    } else {
      count--;
    }
    console.log("Done testing utility checkConsenus",[majorityElement]);
  }
  //log
  // codeRunResponse = [];
  console.log("Done testing utility checkConsenus",[majorityElement]);
  if(count >= majority) {
      let sendTo = [];
      for(let i=0; i<responses[1].length; i++) {
      //compare majorityElement with current element as object
      if(JSON.stringify(responses[1][i]) === JSON.stringify(majorityElement)) {
        sendTo.push(responses[0][i])
      }
    }
    console.log("Done testing utility checkConsenus",[majorityElement, sendTo]);
    return [majorityElement, sendTo];
  }
  console.log("Done testing utility checkConsenus",count);
  return [null, []];
}
function makeTestCodeRequest(ip,code){
  axios.post(`http://${ip}/testCode`, code, {
        headers: {
            'Content-Type': 'text/plain'
        }
    })
}

function writeTransaction(fileName, transaction) {
  return new Promise((resolve,reject) => {
    fs.appendFile(fileName, JSON.stringify(transaction), (error) => {
    if (error) {
      // console.error(`Error saving file: ${error}`);
      reject(error);
    }

    // console.log('File saved successfully');
    resolve();
  })});

}


//export function
module.exports = {
    getIpAddresses: getIpAddresses,
    bootRun: bootRun,
    testCode: testCode,
    codeRunResponse: codeRunResponse,
    myIP: myIP,
    coins: coins,
    writeTransaction: writeTransaction,
    checkConsenus: checkConsenus,
    makeTestCodeRequest: makeTestCodeRequest
}