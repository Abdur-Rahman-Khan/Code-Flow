language_input = document.getElementById('language')
problemId_input = document.getElementById('problemId')
output_para = document.getElementById('output')
passed_para = document.getElementById('passed')
failed_para = document.getElementById('failed')
noConsenus_para = document.getElementById('noConsensus')
let flag=true;
let interval=null;
async function sendCodeToServer() {
    console.log("sendCodeToServer Function in index.js");
    const fileContents = await readInputFile();
    // console.log("Here",fileContents);
    fetch('http://localhost:3000/testCodeBackend', {
        mode: 'no-cors',
        method: 'post',
        headers: {
        //   'Content-Type':  'application/json',
        "Content-type": 'text/plain'
        // //   'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ code: fileContents, language: language_input.options[language_input.selectedIndex].value, problemId: problemId_input.options[problemId_input.selectedIndex].value }),
        // body: JSON.stringify({ code:  `${fileContents}`, language: 'javascript' }),

    });
}

async function readInputFile() {
    return new Promise((resolve, reject) => {
    const fileInput = document.getElementById('inputFile');
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        const fileContents = reader.result;
        resolve(fileContents);
      };
  
      reader.onerror = () => {
        reject(reader.error);
      };
    reader.readAsText(file);
    });
}
//function which fetch the response from server every one second
async function fetchResponseFromServer() {
    console.log("fetchResponseFromServer Function in index.js");
    const response = await fetch('http://localhost:3000/getFrontendStatus',{
      mode: 'no-cors',
      method: 'get'});
    const data = await response.text();
    console.log(data);
    // console.log(response);
    if(data=="passed"){
      passed_para.style.display="block";
      output_para.style.display="none";
      failed_para.style.display="none";
      noConsenus_para.style.display="none";
      clearTimeout(interval);

    }
    else if(data=="noConsensus"){
      passed_para.style.display="none";
      output_para.style.display="none";
      failed_para.style.display="none";
      noConsenus_para.style.display="block";
      clearTimeout(interval);

    }
    else if(data=="none"){
      console.log("None");
    }
    else {
      clearTimeout(interval);
      console.log(failed_para.innerText);
      failed_para.innerText=data;
      passed_para.style.display="none";
      output_para.style.display="none";
      failed_para.style.display="block";
      noConsenus_para.style.display="none";
    }
    // if(data.status == "done"){
    //     console.log("done");
    //     clearInterval(interval);
    //     document.getElementById('output').value = data.output;
    // }
}
//function which calls fetchResponseFromServer every one second
function callFetchResponseFromServer() {
    console.log("callFetchResponseFromServer Function in index.js");
    console.log(output_para.style.display);

    if(output_para.style.display != "none" && flag){
      interval = setInterval(fetchResponseFromServer, 1000);
      flag=false;
  }
}
// callFetchResponseFromServer();
// fetchResponseFromServer();