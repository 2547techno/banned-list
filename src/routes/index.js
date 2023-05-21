const router = require("express").Router();
const { REDIRECT_URI } = require("../../config.json")

router.get("/", (req,res) => {
    res.render("index", {REDIRECT_URI})
})

module.exports = router;