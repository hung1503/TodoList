
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');
const workItems = [];

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://hung15032000:hungbeo1503@cluster0.mys0j.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const todoSchema = new mongoose.Schema ({
  name: String
});

const Item = mongoose.model("Item", todoSchema);

const item1 = new Item({
  name: "Welcome to the to-do list"
});

const item2 = new Item({
  name: "Add new item by clicking the plus sign"
});

const item3 = new Item({
  name: "<== Hit that checkbox to delete the box"
});

const defaultItems = [item1, item2, item3];

const listSChema = {
  name: String,
  items: [todoSchema]
}

const List = mongoose.model("List", listSChema);

app.get("/", function(req, res){
  Item.find(function(err, foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems, function(err){});
      res.redirect("/");
    }
    else{
      // let day = date.getDate();
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });


});

app.post("/", function(req, res){
  const itemName = req.body.addItem;
  const listName = req.body.list;
  const newItem = new Item({
    name: itemName
  });

  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, result){
      result.items.push(newItem);
      result.save();
      res.redirect("/" + listName);
    });
  }
})

app.post("/delete", function(req, res){
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkItemId, function(err){
        res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }



});

app.get("/:topic", function(req, res){
  const requestRoute = _.capitalize(req.params.topic);
  List.findOne({name: requestRoute}, function(err, result){
    if(!err){
      if(result){
        // show an existing list
        res.render("list", {
          listTitle: result.name,
          newListItems: result.items
        });
      }
      else {
        // create a new list
        const list = new List({
          name: requestRoute,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + requestRoute);
      };
    }
    else{
      console.log(err);
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("Server started succesfully!");
});
