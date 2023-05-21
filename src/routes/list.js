const router = require("express").Router();

router.get("/", (req,res) => {
    if (!req.query.logins) {
        return res.send("No users!")
    }

    const list = req.query.logins.split(",")
    if (list.length == 0) {
        return res.send("No users!")
    }

    listStr = "<pre>";
    for(let user of list) {
        listStr += `${user}<br>`
    }
    listStr += "</pre>"

    res.send(listStr)
})

module.exports = router;