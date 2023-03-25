const knownIPs = new Set();

function getIpAddresses() {
  return Array.from(knownIPs);
}

function bootRun(){
    console.log("bootRun");
    //populate knownIPs from reading file
    //other startup functions
}
function testCode(code, language) {
  console.log(`Testing code: ${code}`);
  console.log(`Language: ${language}`);
  //return object with result and error message

  return { result: 'success' };
}

//export function
module.exports = {
    getIpAddresses: getIpAddresses,
    bootRun: bootRun,
    testCode: testCode
}