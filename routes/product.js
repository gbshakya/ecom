const express = require("express")
const { addProduct } = require("../controller/productcontroller")
const router = express.Router()

router.route("/testproduct").post(addProduct);

module.exports = router