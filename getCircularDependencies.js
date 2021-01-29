const madge = require('madge');
 
madge(`./server.js`).then((res) => {
    console.log(res.circular());
});