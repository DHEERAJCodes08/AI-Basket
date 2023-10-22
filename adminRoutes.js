var pool = require("./db");
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const session = require("express-session");
var app = express();
//Since we are using router here to create routes so we need to Specify it WITH the Body Parser

//As Shown Here
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(
  session({
    secret: process.env.ADMIN_SESSION_SECRET,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false,
  })
);

router.get("/dashboard", (req, res) => {
  if(req.session.isLoggedIn) { 
  res.render("Admin");
  } 
  else(res.redirect("/admin/AdminLoginPannel"));
});

router.get("/AdminLoginPannel", (req, res) => {
  res.render("AminLogin");
});


router.get('/AdminLogout', (req, res) => {
  req.session.destroy();
  res.redirect("/admin/AdminLoginPannel");
})
//Admin Login Authentication
router.post("/AdminLoginPannel", async (req, res) => {
  console.log("Submmited");

  const { name, password } = req.body;
  // console.log(name, password);

  const checkAdminAuthetication = {
    text: "Select * from admin_login where name = $1 and password = $2",
    values: [name, password],
  };

  try {
    console.log("We are in The Admin Login");
    const { rows, rowCount } = await pool.query(checkAdminAuthetication);
    console.log(rows, rowCount);
    if (rowCount === 1) {
      console.log("Admin Successfully logged in");
      req.session.isLoggedIn = true;
      res.render("Admin");
    } else res.send("Check Username and Password");
  } catch (err) {
    console.log("Error Executing the Admin Login Query" + err);
  }
});

module.exports = router;
