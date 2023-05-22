const router = require("express").Router();
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = require("../../config.json")

router.get("/", async (req,res) => {
    if (req.query.error || !req.query.code) {
        return res.redirect("/error")
    }

    let token;
    try {
        token = await generateToken(req.query.code)
    } catch(err) {
        console.log(err);
        return res.redirect("/error")
    }
    
    let userId;
    try {
        userId = await getUserId(token)
    } catch(err) {
        console.log(err);
        return res.redirect("/error")
    }

    const bannedList = await getBannedList(token, userId)

    let queryString = bannedList.map(u => u["user_login"]).join(",")


    const list = bannedList.map(u => u["user_login"])
    let listStr = "<pre>";
    for(let user of list    ) {
        listStr += `${user}<br>`
    }
    listStr += "</pre>"

    res.send(listStr)
    // res.redirect(`/list?logins=${queryString}`)
})

async function generateToken(code) {
    let params = new URLSearchParams()
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET)
    params.append("code", code)
    params.append("grant_type", "authorization_code")
    params.append("redirect_uri", REDIRECT_URI)

    let url = new URL("https://id.twitch.tv/oauth2/token")
    url.search = params
    
    let token;
    const response = await fetch(url, {
        method: "POST",
    })
    const json = await response.json();
    token = json["access_token"]
    if (!token) throw new Error("Token value: " + token)
    
    return token
}

async function getUserId(token) {
    const idRes = await fetch("https://id.twitch.tv/oauth2/validate", {
        headers: {
            "Authorization": `OAuth ${token}`
        }
    }).then(res => res.json())

    if (!idRes["user_id"]) throw new Error("No user_id!")

    return idRes["user_id"]
}

async function getBannedList(token, channel_id) {
    let list = []
    let cursor;
    
    while(true) {
        const res = await requestBannedList(token, channel_id, cursor)
        cursor = res.pagination.cursor;
        list = list.concat(res.data)
        
        if (!cursor) {
            return list
        }
    }
}

async function requestBannedList(token, channel_id, cursor) {
    let params = new URLSearchParams()
    params.append("broadcaster_id", channel_id)
    params.append("first", 100)
    if (cursor) {
        params.append("after", cursor)
    }

    let url = new URL("https://api.twitch.tv/helix/moderation/banned")
    url.search = params

    const bannedRes = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Client-Id": CLIENT_ID
        }
    }).then(res => res.json())

    return bannedRes
}

module.exports = router;