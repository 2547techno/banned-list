const router = require("express").Router();
const { REDIRECT_URI, CLIENT_ID } = require("../../config.json")

router.get("/", (req,res) => {
    res.render("index", {REDIRECT_URI, CLIENT_ID})
})

module.exports = router;