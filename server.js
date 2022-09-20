const express = require("express");
const port = process.env.PORT || 3001;
const app = express();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
app.use(express.urlencoded({ extended: false }));

var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://kampus-gratis2-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "gs://beta-be-kampus-gratis.appspot.com",
});
const bucket = admin.storage().bucket();
let db = admin.firestore();

let a = db.collection("users");
app.post("/data", async (req, res) => {
  let docRef = a.doc(req.body.user.name);
  await docRef.set({
    hobby: req.body.user.hobby,
    age: req.body.user.age,
  });
  res.send("done");
});

app.post(
  "/upload",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "nin", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // const name = saltedMd5(req.files.file.originalname, "SUPER-S@LT!");
      // const fileName = name + path.extname(req.files.file[0].originalname);
      const fileName =
        uuidv4() + "-" + req.files.file[0].originalname.split(" ").join("-");
      const fileBuffer = req.files.file[0].buffer;

      const imageName =
        uuidv4() + "-" + req.files.image[0].originalname.split(" ").join("-");
      const imageBuffer = req.files.image[0].buffer;

      const ninImage =
        uuidv4() + "-" + req.files.nin[0].originalname.split(" ").join("-");
      const ninBuffer = req.files.nin[0].buffer;

      await bucket
        .file(`documents/${fileName}`)
        .createWriteStream()
        .end(fileBuffer);

      await bucket
        .file(`documents/${imageName}`)
        .createWriteStream()
        .end(imageBuffer);

      await bucket
        .file(`documents/${ninImage}`)
        .createWriteStream()
        .end(ninBuffer);

      return res.status(201).json({
        status: true,
        message: "success upload",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        error,
      });
    }
  }
);

app.get("/file", async (req, res, next) => {
  try {
    const getFile = await bucket.getFiles();
    // console.log("getFile => ", getFile);
    console.log(getFile[0][1].metadata.mediaLink);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error,
    });
  }
});

app.listen(port, (req, res) => {
  console.info(`Running on ${port}`);
});
