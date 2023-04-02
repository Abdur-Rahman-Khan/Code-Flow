const { exec } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');


const knownIPs = new Set();
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
  return Array.from(knownIPs);
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
    resolve({status:1, compiledFile: 'a.exe'});
  })});
}

function runCode(code_exe, test_file, language='C') {
  return new Promise((resolve,reject) => {
    exec(`${lang_data[language].run_cmd} ${code_exe} ${test_file}`,{'timeout': 2000}, (error, stdout, stderr) => {
    if (error) {
      // console.error(`Exec error: ${error}`);
      return;
    }

    if (stderr) {
      // console.error(`Execution error: ${stderr}`);
      resolve(stderr)
    }

    // console.log(`Execution success: ${stdout}`)
    resolve(stdout);
  })});
}
async function isCorrectOutput(problemId, given_ans, testFile) {
  correct_ans = await runCode(`Problems\\P${problemId}\\a.exe`, testFile);
  if(given_ans === correct_ans) {
    return true
  }
  return false;
}

async function runAllTests(problemId, code_exe, language) {
  test_hashes = [];
  for(let i=0; i<3; i++) {
      testFile = `Problems\\P${problemId}\\test${i}.txt`
      given_ans = await runCode(code_exe, testFile, language);
      var hash = crypto.createHash('md5').update(given_ans).digest('hex');
      test_hashes.push(hash);
      if(!await isCorrectOutput(problemId, given_ans, testFile)) {
        return { 'status': `Test case ${i} Failed!`, 'meta_data': test_hashes};
      }
  }
  return { 'status': 'All Test Cases Passed!', 'meta_data': test_hashes};
}

async function testCode(code, language, problemId) {
  // console.log(`Testing code: ${code}`);
  console.log(`Language: ${language}`);
  console.log(`Problem Id: ${problemId}`);
  //return object with result and error message
  // Save code to file
  fileName = 'code';
  await saveCode(fileName, code, language);
  compiled = await compileCode(fileName, language);
  console.log(compiled)
  if(!compiled.status) {
      return { result: 'Compilation Error', test_hashes: []};
  }
  return await runAllTests(problemId, compiled.compiledFile, language);
}

//export function
module.exports = {
    getIpAddresses: getIpAddresses,
    bootRun: bootRun,
    testCode: testCode
}