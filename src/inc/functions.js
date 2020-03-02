import {
	IgApiClient
} from 'instagram-private-api';
import MongoClient from "mongodb"

var ObjectId = require('mongodb').ObjectID;

export function follow_cron() {
	var conn = MongoClient.connect("mongodb://localhost", { useUnifiedTopology: true })
	conn.then((db) => {
        console.log("Started follow cronjob")
		var users = db.db("instagram").collection("users");
		users.find({}).toArray(async (err, users_arr) => {
			if (err) throw err;
			for (const user of users_arr) {
                console.log(user)
				var ig = await login(user.username, user.password);
				var users_to_follow = users_arr.filter((u) => {
					return (!user.following.includes(u._id) && user._id != u._id)
                })
                if(users_to_follow.length == 0)
                    continue;
				users_to_follow.forEach(async (user_to_follow) => {
					await follow(ig, user_to_follow.username)
                })
				users.updateOne(
					{ _id : new ObjectId(user._id) },
					{
						$addToSet : {
							following : {
								$each : users_to_follow
							}
						}
					},
					(err) => {
						if (err) throw err;
					}
				)
			}
        })
	})
	conn.catch((err) => {
		console.log(err)
    })
}

async function login(username, password) {
    var ig = new IgApiClient();
    ig.state.generateDevice(username);
    try {
        await ig.account.login(username, password)
    } catch (error) {
        throw error
    }
    return ig;
}

async function follow(ig, username) {
    try {
        let userId = await ig.user.getIdByUsername(username)
        await ig.friendship.create(userId)
    } catch (error) {
        throw error;
    }
}

// TODO : Make the function work

// export function like(ig, username) {
//     Bluebird.try(async () => {
//         let userId;
//         Bluebird.try(async () =>{
//             userId = await ig.user.getIdByUsername(username)
//         }).catch(() => {
//             console.log("error!")
//         })
//         const user = ig.feed.user(userId);
//         const posts = await user.items();
//     }).catch(() => {
//         console.log("error!")
//     });
// }