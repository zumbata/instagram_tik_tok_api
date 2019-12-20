import request from 'request-promise'
export async function getUid(username) {
    var uid = await request({
        uri: `https://www.instagram.com/${username}/?__a=1`,
        json: true
    }).then((body) => {
        return uid = parseInt(body.graphql.user.id);
    });
    return uid;
}
