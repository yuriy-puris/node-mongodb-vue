var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var mongoClient = require("mongodb").MongoClient;
var url = 'mongodb://localhost:27017/usersdb';
var users = [
  {
    name: 'Tom',
    age: 23
  },
  {
    name: 'Alice',
    age: 23
  },
  {
    name: 'Bob',
    age: 23
  }
];
mongoClient.connect(url, function(err, db) {
  var collection = db.collection('users');
  collection.insertMany(users, function(err, result) {
    console.log(result);
    db.close();
  });

  // db.collection("users").drop(function(err, result) {
  //   console.log(result);
  //   db.close();
  // })

});

var app = express();
var jsonParser = bodyParser.json();

app.use(express.static(__dirname + '/public'));


//get list data
app.get('/api/users', function(req, res) {
  var content = fs.readFileSync('user.json', 'utf8');
  var users = JSON.parse(content);
  res.send(users)
});

//get user
app.get('/api/users/:id', function(req, res) {
  var id = req.params.id;
  var content = fs.readFileSync('user.json', 'utf8');
  var users = JSON.parse(content);
  var user = null;
  for(var i=0; i<users.length; i++) {
    if(users[i].id == id) {
      index = i;
    }
  }

  if(user) {
    res.send(user)
  } else {
    res.status(404).send()
  }

});

//post data
app.post("/api/users", jsonParser, function (req, res) {

  if(!req.body) return res.sendStatus(400);

  var userName = req.body.name;
  var userAge = req.body.age;
  var user = {
    name: userName,
    age: userAge
  };

  var data = fs.readFileSync("user.json", "utf8");
  var users = JSON.parse(data);

  // находим максимальный id
  var id = Math.max.apply(Math,users.map(function(o) {
    return o.id;
  }));
  // увеличиваем его на единицу
  if(!Number.isFinite(id)) {
    user.id = 1;
  } else {
    user.id = id+1;
  }
  // добавляем пользователя в массив
  users.push(user);
  var data = JSON.stringify(users);
  // перезаписываем файл с новыми данными
  fs.writeFileSync("user.json", data);
  res.send(user);
});

app.delete("/api/users/:id", function(req, res) {

  var id = req.params.id;
  var data = fs.readFileSync("user.json", "utf8");
  var users = JSON.parse(data);
  var index = -1;
  // находим индекс пользователя в массиве
  for(var i=0; i<users.length; i++) {
    if(users[i].id==id) {
      index=i;
      break;
    }
  }
  if(index || index === 0) {
    // удаляем пользователя из массива по индексу
    var user = users.splice(index, 1)[0];
    var data = JSON.stringify(users);
    fs.writeFileSync("user.json", data);
    // отправляем удаленного пользователя
    res.send(user);
  }
  else{
    res.status(404).send();
  }
});

// изменение пользователя
app.put("/api/users", jsonParser, function(req, res) {

  if(!req.body) return res.sendStatus(400);

  var userId = req.body.id;
  var userName = req.body.name;
  var userAge = req.body.age;

  var data = fs.readFileSync("user.json", "utf8");
  var users = JSON.parse(data);
  var user;
  for(var i=0; i<users.length; i++) {
    if(users[i].id==userId) {
      user = users[i];
      break;
    }
  }
  // изменяем данные у пользователя
  if(user) {
    user.age = userAge;
    user.name = userName;
    var data = JSON.stringify(users);
    fs.writeFileSync("user.json", data);
    res.send(user);
  } else {
    res.status(404).send(user);
  }
});

app.listen(3000, function(){
  console.log("Сервер ожидает подключения...");
});