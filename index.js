var pool = require("./db");
const express = require("express");
const path = require("path");
const env = require("env");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const session = require("express-session");
const { log, Console } = require("console");
const fileUpload = require("express-fileupload");
const imgurUploader = require("imgur-uploader");
require("dotenv").config();

var app = express();
app.use(fileUpload());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Calling the Admin interface Routes
const adminRoutes = require('./adminRoutes');
app.use('/admin', adminRoutes);

// Middlewares
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session is Create here
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false,
  })
);

console.log("Session created Succefully!");


//Establish database connection
pool.connect(function (error, res) {
  console.log("We are CONNECTING the DATABASE connection");

  if (error) throw error;
  console.log("database connection established");
});




// Routes
app.get("/", function (req, res) {
  res.redirect("Home.html");
});

app.get("/Login", async (req, res) => {
  if (req.session.isLoggedIn) {
    res.redirect("Home.html");
  } else {
    res.redirect("Login.html");
  }
});

app.get("/userProfile.html", async (req, res) => {
  res.redirect("userProfile.html");

  // for fetching the values from the database and console.log it
});

app.get("/404Error", function (req, res) {
  res.redirect("Notfound.html");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (!err) {
      console.log("Session.destroy");
      console.log("Logout Successfully");
      res.redirect("/Login");
    }
  });
});

/* -------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */

//This if to Show all the Other Information Shown in the edit basket Page
app.get("/editbasket/:basket_name/:basket_id", async (req, res) => {
  if(req.session.isLoggedIn){

 
  console.log("----We are in the editbasket Mode----");
  var basket_id = req.params.basket_id; // Corrected assignment
  req.session.basketId = basket_id; //Storing it in the session
  var basket_name = req.params.basket_name; // Corrected assignment
  console.log(basket_id);

  //LEFT SIDE
  //this is for the Left Side PAnnel Where We Show ALL Ai
  const allsearchitemquery = {
    text: "Select * from allsearchitem",
  };

  try {
    const { rows, rowCount } = await pool.query(allsearchitemquery);
    if (rowCount >= 1) {
      var allsearchitem = rows;
      console.log("Succesfully search Items loaded");
    } else "No results found";
  } catch (err) {
    console.log("Showing the Data Failed " + err);
  }

  //RIGHT SIDE
  // THIS IS FOR THE RIGHT SIDE
  //this Query is to Shoe the Basket items present in the basket of the user!!

  const showBasketItemquery = {
    text: "Select * from basket_item where user_id = $1 and basket_id = $2",
    values: [req.session.userId, basket_id],
  };

  try {
    const { rows, rowCount } = await pool.query(showBasketItemquery);
    console.log(rows);
    var editbasketProfile = req.session.profileimg;
    var basketItem = rows;
    if (rowCount >= 1) {  
      console.log("basket name" + basket_name + " " + "Contains Items");
    } else "basket " + basket_name + "contains No items";
  } catch (err) {
    console.log("Error Exuciting the showBasketItemquery" + err);
  }

  //ENDS HERE
  res.render("editBasket", {
    editbasketProfile,
    basket_name,
    basketItem,
    allsearchitem,
  });
}

else(res.redirect("/Login") )
});

/* -------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */

//This is for Adding Ai using the Drag and Drop
app.post("/add-to-basket/:itemID/:itemN/", async (req, res) => {
  console.log("WE ARE IN THE DRAG AND DROP PAGE");
  var itemId = req.params.itemID;
  var itemName = req.params.itemN;

  //Query for obtanin the img link and the Ai link for the draggeditmem ;

  const imgandlinkQuery = {
    text: "SELECT item_link, item_img FROM allsearchitem WHERE item_id = $1 AND item_name = $2",
    values: [itemId, itemName],
  };

  try {
    const { rows, rowCount } = await pool.query(imgandlinkQuery);
    if (rowCount === 1) {
      console.log(rows);
      var itemLink = rows[0].item_link;
      var itemImg = rows[0].item_img;
    }
  } catch (error) {
    console.log("Error found while getting AI img and Link" + error);
  }

  //Query to insert the propreties of the dragged element
  const draganddropQuery = {
    text: "INSERT INTO basket_item(user_id, basket_id, item_id, item_name , item_link, item_img) VALUES($1, $2, $3, $4 , $5, $6)",
    values: [
      req.session.userId,
      req.session.basketId,
      itemId,
      itemName,
      itemLink,
      itemImg,
    ],
  };

  try {
    const { rows, rowCount } = await pool.query(draganddropQuery);
    if (rowCount === 1) {
      console.log("Ai Added Succesfully");
    } else {
      console.log("Data not Inserted");
      res.status(400).json({ error: "Data not Inserted" });
    }
  } catch (err) {
    console.log("Error InserTing the Item to the Database " + err);
  }
});

/* -------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */

//This for the Removal of the Ai item from the Basket Name Through the Delete Button
app.post('/remove/:item_id', async(req , res)=>{
  
  var item_id = req.params.item_id;

  console.log("Removing basket Id " + req.session.basketId +" "+ "and Item ID "+ item_id) 
  console.log("-------------------------");

  const getbasketNametoreturnDelete = {
    text: "Select basket_name from user_basket where basket_id = $1 and user_id = $2",
    values: [req.session.basketId , req.session.userId ]
  }
console.log("We are getting the basket name ");
  try{
    const{rows, rowCount} = await pool.query(getbasketNametoreturnDelete);
    console.log(rows);
    var basket_name  = rows[0].basket_name;
  }
  catch(err){
    console.log("Error in getting the basket_name to rediret on the editpage on delete "+ err)
  }

  const removeAiItemQuery = {
    text : "Delete from basket_item where basket_id=$1 and item_id=$2",
    values: [req.session.basketId,item_id]
  }

  try{
    pool.query(removeAiItemQuery)
    console.log("Ai Item Delete Successfully"); 
    res.redirect('/editbasket/' + encodeURIComponent(basket_name) + '/' + req.session.basketId);

  }

  catch(err){
    console.log("Error Deletion of the Ai Item "+err)
  }
  
  
})

/* -------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */

//so here Basically waht we do is first we check weather the user info are alredy  present in the Database
//if the information is Present then we extract the data in the form of rows and then store in the form of user and move the user with his info to the Ejs file
// if the info are not present then we cannot move them to ejs file because it will show errors so we move the user to userProfile.html where he saves his info
//and then on Post method we send him to the ejs file
app.get("/userProfile", async (req, res) => {
  console.log("We are DISPLAYING THE PROFILE INFORMATION ");

  // We  will fetch data and pass it to the EJS userProfile here
  if (req.session.isLoggedIn) {
    //this query will check weather the userinfo are alredy present in the database or Not
    const query = {
      text: "Select * from userinfo where user_id = $1",
      values: [req.session.userId],
    };
    console.log(req.session.userId);
    console.log("getting the data...");

    //this Query is For the User Basket Information

    const extractBasketName = {
      text: "Select * from user_basket where user_id = $1 ",
      values: [req.session.userId],
    };
    console.log("getting the Basket Names");

    try {
      const { rows, rowCount } = await pool.query(query);

      if (rowCount === 1) {
        console.log(rows);
        const user = rows[0]; //user info Stored under user
        req.session.profileimg = user.profileimg;
        console.log("here we go ");

        //For the User Basket Information
        const { rows: basketRows, rowCount: basketRowCount } = await pool.query(
          extractBasketName
        );
        if (basketRowCount >= 1) {
          console.log("here is me ");
          console.log(basketRows);
          console.log(basketRowCount);
          req.session.basketCount = basketRowCount;
          var basket = basketRows; // basket info Stored under basket
        }

        res.render("userProfile", { user, basket }); // Render userProfile.ejs
      } else {
        console.log("User data not found");
        res.redirect("userProfile.html");
      }
    } catch (error) {
      console.error("Error executing query:", error);
    }
  } else {
    res.redirect("SingUp.html");
  }
});

/* -------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */

//Handle SingUp request
app.post("/SingUp.html", async (req, res) => {
  // user registration
  var user = req.body.name;
  var password = req.body.password;

  console.log(" id and Password are : " + user, +" " + password);

  const query = {
    text: `INSERT INTO userlogin (user_name, user_password) values($1, $2)`,
    values: [user, password],
  };

  const result = await pool.query(query);

  console.log(result);

  if (result.rowCount === 1) {
    console.log("User registration Successfull ");

    res.status(200).redirect("Login.html");
  } else console.log("User registration Failed");
});

/* -------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */

// Handle the login request
app.post("/Login.html", async (req, res) => {
  const { name, password } = req.body;

  try {
    console.log("hit");
    const { name, password } = req.body;

    // Query to check if the name and password match  ,,this is Query object
    const query = {
      text: "SELECT * FROM userlogin WHERE user_name = $1 AND user_password = $2",
      values: [name, password],
    };

    console.log("came");

    const { rows, rowCount } = await pool.query(query);
    if (rowCount === 1) {
      // user login successful
      console.log("came2");
      console.log(rows);

      req.session.userId = rows[0].user_id;
      console.log(req.session.userId);

      req.session.isLoggedIn = true;

      console.log("User " + req.session.userId + "Logged in Succesfully");
      res.redirect("Home.html");
    } else {
      console.log("User " + req.session.userId + "Logged Failaure");
      res.send("Check your username and password");
    }
  } catch (error) {
    console.log("Performing Query Error of Login" + error);
  }
});

/* -------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */

// Your authentication middleware Which makes the Single Button Work Two Ways By the Help of Authentication Status
// 1) the next() function is called to  move to the Next MiddleWare  ie app.get("/check-auth-status", isAuthenticated, (req, res)
// 2) if the req.session.isLoggedIn is true  the we call next() function
// 3)then at the route /check-auth-status  we  Pass the Status = 200
// 4)this status is then Checked in the Profile.js ie userSide , and necessary Operation is performed according to that status
// 5) if the user was not authenticated then we pass the status = 401 to the route /check-aut... , and then it is fetched through the userside in profile.js and necessary Operation are performed according to that status
function isAuthenticated(req, res, next) {
  if (req.session.isLoggedIn) {
    return next(); // User is authenticated, continue to the next middleware
  } else {
    return res.sendStatus(401); // User is not authenticated, return 401 Unauthorized status
  }
}
// Route to check authentication status
// it Points here When we call the Next Middleware function
app.get("/check-auth-status", isAuthenticated, (req, res) => {
  // If the request reaches here, it means the user is authenticated
  res.sendStatus(200); // Return 200 OK status
});

/* -------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */

app.post("/uploadImg", (req, res) => {
  console.log("We are in UPLOADING IMG MODE");

  // Check if files are not empty
  if (!req.files || !req.files.ProfileImg) {
    return res.status(400).send("No files found!");
  }

  // If file exists, store it in a variable
  const imgFile = req.files.ProfileImg;

  // Print file details
  console.log(`Received file: ${imgFile.name}, size: ${imgFile.size} bytes`);

  // Upload the file to imgur and receive a callback
  imgurUploader(imgFile.data)
    .then((data) => {
      // Print the data object, and you will find a link
      console.log(data);
      console.log("Uploaded to imgur:", data.link);
      req.session.upload = data.link;
      console.log(req.session.upload);

      //creating Query to Insert the image

      const imgInsert = {
        text: "Update userinfo set profileimg = $1  Where user_id = $2 ",
        values: [req.session.upload, req.session.userId],
      };

      try {
        pool.query(imgInsert);
        console.log("Profile Image Inserted successfully");
      } catch (err) {
        console.log("Error Storing the Profile Img" + err);
      }

      // You can send the link as a response or use it as needed
      // res.status(200).send(`Image uploaded: <a href="${data.link}">${data.link}</a>`);
      res.redirect("/userProfile");
    })
    .catch((err) => {
      console.error("Error uploading to imgur:", err);
      res.status(500).send("Error uploading the image");
    });
});

/* -------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */

app.post("/addBuckets", async (req, res) => {
  /* const basketQuery = {
    text  : "Select * from user_basket where user_id = $1 ",
    values : [req.session.userId]
  }
  const[rows , rowsCount] = await pool.query(basketQuery);
  console.log(rows, rowsCount);
   */

  // To save the BAsket name With The Database
  const { bucketName } = req.body;
  console.log(" We are in ADD BASKET MODE");
  const addBasket = {
    text: "Insert into user_basket(user_id , basket_name) values($1 , $2 )",
    values: [req.session.userId, bucketName],
  };

  try {
    console.log(" 2 Step clear");
    const { rows, rowCount } = await pool.query(addBasket);
    console.log(" 3 Step clear");

    if (rowCount === 1) {
      console.log(
        "Succesfully basket Created with name as" +
          " " +
          bucketName +
          " " +
          "for user_id " +
          " " +
          req.session.userId
      );
      res.redirect("/userProfile");
    } else "Data is Not Found for basketName";
  } catch (err) {
    console.log("Error in InserTing basket name " + err);
  }
});

/* -------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */

app.post("/removeBasket", async (req, res) => {
  console.log("We are in REMOVE BASKET MODE");
  //storing the basket id from the UI to BasketID
  const basketId = req.body.basketId;
  // console.log(req.body.basketId)
  console.log(basketId);

  //First we need to remove the items from the foreign table ie basket_item

  const removeBasketItemFirst = {
    text: "DELETE from basket_item Where user_id = $1 AND basket_id = $2",
    values: [req.session.userId, basketId],
  };

  const removebasketquery = {
    text: "DELETE from user_basket Where user_id = $1 AND basket_id = $2",
    values: [req.session.userId, basketId],
  };

  try {
    const { rows: Rows, rowCount: RowCount } = await pool.query(
      removeBasketItemFirst
    );
    const { rows, rowCount } = await pool.query(removebasketquery);
    res.redirect("/userProfile");
  } catch (err) {
    console.log("Error in Deleting the Basket" + err);
  }
});

/* -------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */

//When the user Update the Existing Profile Information of the Database
app.post("/userProfile", async (req, res) => {
  console.log("We are UPDATEING the Profile Information ");
  if (req.session.isLoggedIn) {
    //Grabing the Values from the  form
    const {
      fullname,
      email,
      phone,
      gender,
      address,
      work,
      DOB,
      location,
      passion,
    } = req.body;

    console.log(
      "Updated Details are as follows: " +
        fullname +
        " " +
        email +
        " " +
        phone +
        " " +
        gender +
        " " +
        address +
        " " +
        work +
        " " +
        DOB +
        " " +
        location +
        " " +
        passion +
        " "
    );

    const updatequery = {
      text: "UPDATE userinfo set name = $1 , email = $2 , phone = $3 , gender = $4 ,  address  = $5 , work = $6 , dob = $7 , location = $8 , passion = $9  WHERE user_id = $10 ",
      values: [
        fullname,
        email,
        phone,
        gender,
        address,
        work,
        DOB,
        location,
        passion,
        req.session.userId,
      ],
    };

    try {
      //executing the query for Updations
      const { rows, rowCount } = await pool.query(updatequery);
      console.log(rows);

      if (rowCount === 1) {
        console.log(
          req.session.userId + " User Information is Updated Successfully"
        );
        res.redirect("/userProfile");
      }
    } catch (error) {
      console.log("Error Performing the Updation Operation " + error);
    }
  } else {
    console.log("User is not Logged in ");
    res.redirect("/Login.html");
  }
});

/* -------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */

//When the user updates his Profile Information for the First Time
app.post("/userProfile.html", async (req, res) => {
  console.log("We are COLLECTING THE PROFILE INFORMATION");
  if (req.session.isLoggedIn) {
    //Grabing the Values from the  form
    const {
      fullname,
      email,
      phone,
      gender,
      address,
      work,
      DOB,
      location,
      passion,
    } = req.body;

    console.log(
      req.session.userId,
      fullname,
      +" " + email,
      +" " + phone,
      +" " + gender,
      +" " + address,
      +" " + work,
      +" " + DOB,
      +" " + location,
      +" " + passion
    );
    //Creating the Query to Store the Data
    const infoquery = {
      text: "Insert into userinfo(user_id, name, email, phone, gender, address, work, dob, location ,passion ) values( $1, $2, $3, $4, $5, $6, $7, $8 ,$9 ,$10 )",
      values: [
        req.session.userId,
        fullname,
        email,
        phone,
        gender,
        address,
        work,
        DOB,
        location,
        passion,
      ],
    };

    //Execute Query Now
    try {
      const { rows, rowCount } = await pool.query(infoquery);
      console.log(rows);

      if (rowCount === 1) {
        console.log(
          "user: " + fullname + " " + "informations are stored in table "
        );
        res.redirect("/userProfile");
      }
    } catch (err) {
      console.log("Error Storing Profile Data" + err);
    }
  } else res.redirect("Login.html");
});

/* -------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */

//Undefined Route or Not Found Route
// app.use((req, res, next) => {
//   res.status(404).redirect("/404Error");
// });

/* -------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */

// Starting Server
app.listen(3000, function (err) {
  if (err) throw err;
  console.log("Server Started");
});

/* -------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */
