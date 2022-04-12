var express = require('express');
var db = require('../../server.js');
 


db.query('SELECT * FROM jlpt.n5', (err,rows) => {
    if(err) throw err;
  
    console.log('Data received from Db:');
    console.log(rows);
  });