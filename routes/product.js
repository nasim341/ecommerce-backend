const express = require("express");
const formidable = require("express-formidable");
const router = express.Router();
const { requireSignin, isAdmin } = require("../middlewares/auth.js")

const {
    create,
    list,
    read
} = require("../controllers/product.js");


router.post("/product", requireSignin, isAdmin, formidable(), create)
router.get("/products", list)
router.get("/product/:slug", read)

module.exports = router;