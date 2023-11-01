const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb+srv://tankimemerson05:EkMV1xiG4C2L09FI@cluster0.jsxdxft.mongodb.net/todolistDB");

  const itemsSchema = new mongoose.Schema({
    name: String
  });

  const Item = mongoose.model("Item", itemsSchema);

  const item1 = new Item({
    name: "Put some task here!"
  });

  const item2 = new Item({
    name: "Add another one!"
  });
  const item3 = new Item({
    name: "Put some more!"
  });

  const defaultItems = [item1, item2, item3];

  const listSchema = {
    name: String,
    items: [itemsSchema]
  }

  const List = mongoose.model("List", listSchema);


  app.get("/", async function(req, res) {

    const foundItems = await Item.find({});

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }

  });


  app.get("/:customListName", async function(req, res) {
    const customListName = _.capitalize(req.params.customListName);

    const foundList = await List.findOne({name: customListName});

    if(!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items
      });
    }

  });

  app.post("/", async function(req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name: itemName
    });

    if (listName === "Today") {
      item.save();

      res.redirect("/");
    } else {
      const foundList = await List.findOne({name: listName});
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    }
  });


  app.post("/delete", async function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
      await Item.findByIdAndRemove(checkedItemId);

      res.redirect("/");
    } else {
      await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}});
      res.redirect("/" + listName);
    }
  });


  app.get("/about", async function(req, res) {
    res.render("about");
  });

  const port = process.env.PORT || 3000;

  app.listen(port, async function() {
    console.log("Server has started.");
  });

}
