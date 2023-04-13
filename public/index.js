language_input = document.getElementById('language')
problemId_input = document.getElementById('problemId')

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
