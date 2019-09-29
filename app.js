// run `node app` to run the app

const express = require('express');
const bodyParser = require('body-parser'); // Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
const path = require('path'); // a core module
const NodeCouchDb = require('node-couchdb');

const couch = new NodeCouchDb({
  // credentials used for couchDb server admin 
  auth: {
    user: 'admin',
    password: 'password'
  }
});

const dbName = "customers";
const viewUrl = "_design/all_customers/_view/all"; 

couch.listDatabases().then(
  function(dbs) {
    console.log(dbs);
  }, 
  function(err){ 
    console.log(err)
  }
);

const app = express();

// set is an express method - https://expressjs.com/en/4x/api.html#app.set
// You may store any value that you want, but certain names can be used to configure the behavior of the server - like 'view engine'. 
app.set('view engine','ejs'); // Set the template engine.  
app.set('views',path.join(__dirname, 'views')); // A directory or an array of directories for the application's views. If an array, the views are looked up in the order they occur in the array.

// app.use() Mounts the specified middleware function or functions at the specified path: the middleware function is executed when the base of the requested path matches path.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// app index
app.get('/', function(req, res){
  // res.render('index');
  couch.get(dbName, viewUrl).then(
    function (data, headers, status) {
      console.log(data.data.rows);
      res.render('index', {
        customers: data.data.rows
      })
    }),
    function (err) {
      console.log(err);      
    };
});

// add a new record
app.post('/customer/add', function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  
  couch.uniqid().then(function (ids) {
    const id = ids[0];
    couch.insert('customers', {
      _id: id,
      name: name,
      email: email
    }).then(
      function (data, headers, status) {
        res.redirect('/');
      },
      function (err) {
        res.send(err);
      });
  });
  //res.send(name);
});

app.listen(3000, function(){
  console.log('Server started on port: 3000' );
});
