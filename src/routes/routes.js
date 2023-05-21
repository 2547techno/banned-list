const router = require("express").Router();
const index = require("./index")
const error = require("./error")
const list = require("./list")
const auth = require("./auth")

router.use("/", index)
router.use("/error", error)
router.use("/list", list)
router.use("/auth/redirect", auth)

module.exports = router;