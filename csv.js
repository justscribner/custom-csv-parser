#!/usr/bin/env node

const [, , ...args] = process.argv;
const csv = require("csv");
const parse = require("csv-parse");
const stringify = require("csv-stringify");
const fs = require("fs");
const path = require("path");
const transform = require("stream-transform");

const input = fs.createReadStream(path.dirname(process.execPath) + `/${args}`);
const parser = parse({ delimeter: ",", columns: true });

const recordChanger = obj => {
  let newObj = {};

  if (obj["Type"] === "Inventory Part") {
    if (obj["Active Status"] === "Active") {
      if (obj["Quantity On Hand"] < 0) {
        newObj.sku = obj["Item"];
        newObj.qty = obj["Quantity On Hand"];
        newObj.price = obj["Price"];
        newObj.type = "simple";
        return newObj;
      }
    }
  }
};

const transformer = transform(
  (record, cb) => {
    setTimeout(function() {
      cb(null, recordChanger(record));
    }, 500);
  },
  { parallel: 1000 }
);

const stringifier = stringify({ header: true }, (err, output) => {
  if (err) throw err;
  fs.writeFile(`NEW${args}`, output, err => {
    if (err) throw err;
    console.log(`NEW${args} saved!`);
  });
});

input
  .pipe(parser)
  .pipe(transformer)
  .pipe(stringifier);
