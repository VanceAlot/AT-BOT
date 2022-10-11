var request = require('request');

const postAndReturn = (relativeUrl, object) => {
    const productionURI = 'https://ramesh-nine.vercel.app/api';
    return new Promise(
        (resolve, reject) => {
            request.post(
                productionURI + relativeUrl,
                { json: object },
                async (err, res, body) => {
                    if (!err && res.statusCode == 200)
                        resolve(body);
                    else {
                        reject(err);
                        throw new err;
                    }
                }
            );
        }
    )
}

module.exports = {
    postAndReturn
}
