import express from "express";
import cors from "cors";
import mongoose from "mongoose";

//Set up a MongoDB connection using Mongoose
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/books"
mongoose.connect(mongoUrl)
mongoose.Promise = Promise //Mongoose supports different Promise libraries. This line sets Mongoose to use the built-in JavaScript ES6 Promise implementation. This way, Mongoose will use the native Promise globally throughout the application.

//Define the models
const Author = mongoose.model("Author", {
  name: String
})

const Book = mongoose.model("Book", {
  title: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author"
  }
})

if (process.env.RESET_DATABASE) {
  console.log("Resetting database!")

  const seedDatabase = async () => {
    await Author.deleteMany(); //This code snippet delets any dubblets when saving

    const tolkien = new Author({ name: "J.R.R Tolkien " })
    await tolkien.save() //Why do we use this save method?

    const rowling = new Author({ name: "J.K. Rowling" })
    await rowling.save()

    await new Book({ title: "A", author: rowling }).save()
    await new Book({ title: "B", author: rowling }).save()
    await new Book({ title: "B", author: rowling }).save()
  }
  //invoke the functions
  seedDatabase();
}

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo!");
});

app.get("/authors", async (req, res) => {
  const authors = await Author.find()
  res.json(authors)
});

app.get("/authors/:id/", async (req, res) => {
  const author = await Author.findById(req.params.id)
  if (author) {
    res.json(author)
  } else {
    res.status(404).json({ error: "Author not found" })
  }
})

app.get("/authors/:id/books", async (req, res) => {
  const author = await Author.findById(req.params.id)
  if (author) {
    const books = await Book.find({ author: mongoose.Types.ObjectId(author.id) })
    res.json(books)
  } else {
    res.status(404).json({ error: "Author not found" })
  }
})

app.get("/books", async (req, res) => {
  const books = await Book.find().populate("author")
  res.json(books)
})


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
