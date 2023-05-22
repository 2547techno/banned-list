const router = require("express").Router();
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = require("../../config.json")
const fs = require('fs');

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
    
    let user
    try {
        user = await getUser(token)
    } catch(err) {
        console.log(err);
        return res.redirect("/error")
    }

    const bannedList = await getBannedList(token, user.user_id)

    // let queryString = bannedList.map(u => u["user_login"]).join(",")

    const list = bannedList.map(u => u["user_login"])
    let listStr = "<pre>";
    for(let login of list) {
        listStr += `${login}<br>`
    }
    listStr += "</pre>"

    saveList(list, user.login)
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

async function getUser(token) {
    const userRes = await fetch("https://id.twitch.tv/oauth2/validate", {
        headers: {
            "Authorization": `OAuth ${token}`
        }
    }).then(res => res.json())

    if (!userRes["user_id"]) throw new Error("No user_id!")
    if (!userRes["login"]) throw new Error("No login!")

    return {
        user_id: userRes["user_id"],
        login: userRes["login"]
    }
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

function saveList(list, username) {
    const now = new Date().getTime();

    console.log("write");
    fs.writeFileSync(`lists/${username}-${now}.txt`, list.join("\n"))
}

module.exports = router;