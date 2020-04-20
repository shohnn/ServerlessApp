const lambdaLocal = require("lambda-local");
const path = require("path");

const executeLambda = async payload => {
  return await lambdaLocal.execute({
    event: payload,
    lambdaPath: path.join(__dirname, "../handler.js"),
    lambdaHandler: "countLines",
    timeoutMs: 60000,
    verboseLevel: 0
  });
};

const validUrlPayload = {
  pathParameters: {
    url: "https%3A%2F%2Fwww.w3.org%2FTR%2FPNG%2Fiso_8859-1.txt"
  },
};

const payloadWithoutUrl = {
  pathParameters: {
  },
};

const payloadWithInvaldiUrl = {
  pathParameters: {
    url: "htp: invalidurl.4net"
  },
};

describe("CountLines", ()=>{

  test("It should return 200 when the payload is valid ", async () => {
    const response = await executeLambda(validUrlPayload);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(105);
  });

  test("It Should return 500  when there is no URL in the paylaod", async () => {
    const response = await executeLambda(payloadWithoutUrl);

    expect(response.statusCode).toBe(500);
  });
  
  test("It Should return 404  when there is an invalid url in the payload", async () => {
    const response = await executeLambda(payloadWithInvaldiUrl);

    expect(response.statusCode).toBe(404);
  });

});

