const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { body, validationResult, check } = require("express-validator");
const app = express();
const port = 3000;

const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

const {
  loadContactData,
  findContactByNama,
  addContact,
  duplicateName,
  deleteContact,
} = require("./utils/contacts");

// Using view templating engine
app.set("view engine", "ejs");
app.use(expressLayouts);

// Built-in Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Flash Data Configuration
app.use(cookieParser("secret"));
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 6000 },
  })
);
app.use(flash());

// Aplication Level Middleware
app.use((req, res, next) => {
  console.log("Time: ", Date.now());
  next();
});

app.get("/", (req, res) => {
  res.render("index", {
    layout: "layouts/main-layout",
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout",
  });
});

app.get("/contact", (req, res, next) => {
  const contacts = loadContactData();

  res.render("contact", {
    layout: "layouts/main-layout",
    contacts,
    info: req.flash("info"),
  });
});

app.get("/contact/add", (req, res) => {
  res.render("contact-add", {
    layout: "layouts/main-layout",
  });
});

app.post(
  "/contact",
  [
    body("full-name").custom((value) => {
      const duplicate = duplicateName(value);
      if (duplicate) {
        throw new Error("Name is already used!");
      }

      return true;
    }),
    check("email", "Email is not valid!").isEmail(),
    check("number", "Phone Number is not valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("contact-add", {
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    }

    const body = {
      nama: `${req.body.fName} ${req.body.lName}`,
      noHP: req.body.number,
      email: req.body.email,
    };

    addContact(body);
    req.flash("info", "Data has been added.");
    res.redirect("/contact");
  }
);

app.get("/contact/delete/:nama", (req, res, next) => {
  var name = req.params.nama;

  const data = loadContactData();
  const contacts = findContactByNama(data, name);

  if (contacts) {
    deleteContact(name);
    req.flash("info", "Data has been deleted.");
    res.redirect("/contact");
  }

  next();
});

app.get("/contact/:nama", (req, res, next) => {
  const contactsData = loadContactData();
  const contacts = findContactByNama(contactsData, req.params.nama);

  // Contacts not found
  if (!contacts) next();

  res.render("detail", {
    layout: "layouts/main-layout",
    contacts,
  });
});

app.use("/", (req, res) => {
  res.status(404);
  res.render("404", {
    layout: false,
  });
});

app.listen(port, () => {
  console.log(`Contact App listening on port ${port}`);
});
