const router = require("express").Router();

router.get("/", (req,res) => {
    res.send("There was an error logging in!")
})

module.exports = router;