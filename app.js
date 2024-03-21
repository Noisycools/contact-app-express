const express = require("express")
const methodOverride = require('method-override')
const expressLayouts = require("express-ejs-layouts")
const { body, validationResult, check } = require("express-validator")
const app = express()
const port = 3000

// Database
require('./utils/db')
const Contact = require('./model/contacts')

// Session and Cookies
const session = require("express-session")
const cookieParser = require("cookie-parser")
const flash = require("connect-flash")

// Using view templating engine
app.set("view engine", "ejs")
app.use(expressLayouts)

// Built-in Middleware
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))

// Flash Data Configuration
app.use(cookieParser("secret"))
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 6000 },
  })
)
app.use(flash())

// Aplication Level Middleware
app.use((req, res, next) => {
  console.log("Time: ", Date.now())
  next()
})

app.get("/", (req, res) => {
  res.render("index", {
    layout: "layouts/main-layout",
  })
})

app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout",
  })
})

app.get("/contact", async (req, res, next) => {
  const contacts = await Contact.find()

  res.render("contact", {
    layout: "layouts/main-layout",
    contacts,
    info: req.flash("info"),
  })
})

app.get("/contact/add", (req, res) => {
  res.render("contact-add", {
    layout: "layouts/main-layout",
  })
})

app.post(
  "/contact",
  [
    body("full-name").custom(async (value) => {
      const duplicate = await Contact.findOne({ name: value })
      if (duplicate) {
        throw new Error("Name is already used!")
      }

      return true
    }),
    check("email", "Email is not valid!").isEmail(),
    check("number", "Phone Number is not valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.render("contact-add", {
        layout: "layouts/main-layout",
        errors: errors.array(),
      })
    }

    const body = {
      name: `${req.body.fName} ${req.body.lName}`,
      number: req.body.number,
      email: req.body.email,
    }

    Contact.insertMany(body).then(() => {
      req.flash("info", "Data has been added.")
      res.redirect("/contact")
    })
  }
)

app.delete('/contact/delete', (req, res, next) => {
  Contact.deleteOne({ _id: req.body.id }).then(() => {
    req.flash("info", "Data has been deleted.")
    res.redirect("/contact")
  })
})

app.get("/contact/edit/:id", async (req, res, next) => {
  const contacts = await Contact.findOne({ _id: req.params.id })
    .catch(() => {
      // Contacts not found
      next()
    })

  res.render("edit", {
    layout: "layouts/main-layout",
    contacts,
    fullName: contacts.name.split(/[ ,]+/),
  })
})

app.put(
  "/contact",
  [
    body("fullName").custom(async (value, { req }) => {
      const duplicate = await Contact.findOne({ name: value })
      if (value !== req.body.oldName && duplicate) {
        throw new Error("Name is already used!")
      }

      return true
    }),
    check("email", "Email is not valid!").isEmail(),
    check("number", "Phone Number is not valid!").isMobilePhone("id-ID"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req)
    if (req.body.fullName !== req.body.oldName) {
      if (!errors.isEmpty()) {
        return res.render("edit", {
          layout: "layouts/main-layout",
          errors: errors.array(),
          contacts: req.body,
          fullName:
            req.body.oldName.split(/[ ,]+/) || req.body.fullName.split(/[ ,]+/),
        })
      }
    }

    const body = {
      name: `${req.body.fName} ${req.body.lName}`,
      number: req.body.number,
      email: req.body.email,
    }

    Contact.updateOne(
      { _id: req.body.id },
      { $set: body },
    ).then(() => {
      req.flash("info", "Data has been updated.")
      res.redirect("/contact")
    })
  }
)

app.get("/contact/:id", async (req, res, next) => {
  const contacts = await Contact.findOne({ _id: req.params.id })
    .catch(() => {
      // Contacts not found
      next()
    })

  res.render("detail", {
    layout: "layouts/main-layout",
    contacts,
  })
})

app.use("/", (req, res) => {
  res.status(404)
  res.render("404", {
    layout: false,
  })
})

app.listen(port, () => {
  console.log(`Contact App listening on port ${port}`)
})
