const lambdaLocal = require("lambda-local");
const path = require("path");
const fs = require('fs');
const CountLinesFile = require("../CountLinesFile/countLinesFile");

const executeLambda = async payload => {
  return await lambdaLocal.execute({
    event: payload,
    lambdaPath: path.join(__dirname, "../handler.js"),
    lambdaHandler: "countLinesFile",
    timeoutMs: 60000,
    verboseLevel: 0
  });
};

var filepath = path.join(__dirname, "./testfile5Lines.txt")
const fiveLinesFile = fs.readFileSync(filepath, 'utf8')

console.log(fiveLinesFile);
//const fiveLinesFile = "./testfile5Lines.txt";


describe("CountLinesFile", ()=>{

  test("It should return 5 when the payload is valid ", async () => {

    var countLinesFile = new CountLinesFile(fiveLinesFile);
    var result=await countLinesFile.execute();

    expect(result).toBe(5);
  });


});

