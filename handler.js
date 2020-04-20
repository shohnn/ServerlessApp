'use strict';
const BadRequestError = require("./badRequestError");
const InvalidUrlError = require("./invalidUrlError");
const CountLines = require("./CountLinesURL/countLinesURL");
const CountLinesFile = require("./CountLinesFile/countLinesFile");
const HttpStatus = require("http-status-codes");
const querysgtring = require("query-string");
const validUrl = require('valid-url');
const AWS = require('aws-sdk');
const util = require('util');


module.exports.hello = async event => {

  return buildReponse(HttpStatus.OK,"Hello there")
 
};

module.exports.countLines = async event => {
  var statusCode = HttpStatus.OK;

  try {
    var url = event["pathParameters"]["url"];

    if (!url){
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      throw new BadRequestError("Missing url");
    }

    var decodedUrl=querysgtring.parse("url="+url);

    if(!validUrl.isUri(decodedUrl.url)){
      statusCode = HttpStatus.NOT_FOUND;
      throw new InvalidUrlError("Invalid URL");
    }

  } catch (error) {
    return buildErrorResponse(error, statusCode);
  }

  var countLines = new CountLines(decodedUrl.url);
  var result=await countLines.execute();
  
  return buildReponse(statusCode, result);
};


module.exports.countlinesFile = async event => {

    // get reference to S3 client
    var s3 = new AWS.S3();

    // Read options from the event.
    console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
    var srcBucket = event.Records[0].s3.bucket.name;
    console.log(srcBucket);
    // Object key may have spaces or unicode non-ASCII characters.
    var srcKey    =
    decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
    var dstBucket = "fileparser-dev-john-e";

    // Sanity check: validate that source and destination are different buckets.
    if (srcBucket == dstBucket) {
      callback("Source and destination buckets are the same.");
      return;
    }

    var params = { 
      Bucket: srcBucket,
      Key: event.Records[0].s3.object.key,
    };

    
    var data = await s3.getObject(params).promise();
    var textFromData = data.Body.toString('utf-8');

    var countLinesFile = new CountLinesFile(textFromData);
    var result=await countLinesFile.execute();

    // Convert the result to Buffer
    var base64data = Buffer.from(result.toString(), 'utf8');
    //After reading the file we upload it to the E-bucket
    // Setting up S3 upload parameters
    var uploadParams = {
        Bucket: dstBucket,
        Key: srcKey, // File name you want to save as in S3
        Body: base64data
    };

    // Uploading files to the bucket
    s3.upload(uploadParams, function(err, data) {
        if (err) {
            throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
    });
  
};

function buildReponse(httpStatusCode, body) {
  return {
    statusCode: httpStatusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body
  };
}

function buildErrorResponse(error, httpStatusCode) {
  console.error(error);

  return {
    statusCode: httpStatusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify({
      message: error.message
    })
  };
}

