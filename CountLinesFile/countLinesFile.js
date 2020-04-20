"use strict";

class CountLinesFile {
  constructor(file) {
    this.file = file;
  }

  async execute() {
    var splittedLines= this.file.split('\n');
    return splittedLines.length;
  }

}

module.exports = CountLinesFile;
