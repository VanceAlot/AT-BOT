// const streamToBuffer = async (stream) => {
//     return new Promise((resolve, reject) => {
//       const data = [];
//       stream.on('data', (chunk) => {
//         data.push(chunk);
//       });
//       stream.on('end', () => {
//         resolve(Buffer.concat(data))
//       })
//       stream.on('error', (err) => {
//         reject(err)
//       })
//     })
//   }


// const getBuffer = async (url) => {
//     const res = await fetch(url);
//     const buffer = await streamToBuffer(res.body);
//     return buffer;
// }

// module.exports = {
//     getBuffer
// }

const axios = require('axios');
const getBuffer = async (url) => {
	try {
		const res = await axios({
			method: "get",
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			responseType: 'arraybuffer'
		})
		return res.data
	} catch (err) {
		return err
	}
}

module.exports = {
    getBuffer
}

if (require.main === module) {
    const test = async () => {
        const res = await getBuffer("http://www.manit.ac.in/sites/default/files/Urgent%20Notice%20for%20revised%20academic%20calendar%20for%20UG%20Oct.-Dec.%202022.pdf");
        console.log(res);
    }
    test();
}
