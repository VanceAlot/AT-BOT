var request = require('request');
const { postAndReturn } = require('../abstractions/postAndReturn.js')

// decided user flow ->
// phone no.
// group id - > college, branch, section.
// get subject from mongodb
// create buttons OR confirm input from user

module.exports = applicationLogic = async (ws, chatUpdate) => {

    const prefix = ".";
    messageObj = chatUpdate.messages[0];
    // console.log('---------------------');
    // console.log(messageObj);
    let body;
    if(messageObj.message){
        body = messageObj.message.conversation.toLowerCase();
    }
    let senderJid;
    let groupId;
    if (messageObj.key.participant) {
        senderJid = messageObj.key.participant;
        groupId = messageObj.key.remoteJid;
    } else {
        // it's a DM
        senderJid = messageObj.key.remoteJid;
    }

    console.log(messageObj.pushName); // Messeage jisne bheja
    // console.log(groupId); // groupid
    // console.log(senderJid); // phone no
    // console.log(body); // message text
    // console.log('---------------------')

    // actual logic
    if (!messageObj.message) return;
    if (!messageObj.key.fromMe) {
        if (body[0] == prefix) {
            let command = body.replace(prefix, '').trim().split(/ +/).shift();
            let args = body.trim().split(/ +/).slice(1);
            switch (command) {
                // case _________________________________
                case 'present':
                case 'p':
                    const reply = await postAndReturn('/attendance', { 'pnum': senderJid, 'subject': args[0] });
                    ws.reply(reply);
                    break;
                // case __________________________________
                case 'subjects':
                    var subjectArr = await postAndReturn('/getSubjects', { 'gno': groupId });
                    subjectArr.forEach(element => {
                        ws.reply(element);
                    });
                    break;
                case 'display':
                    ws.reply('Your attendance in all subjects is as follows - ');
                    var subjectArr = await postAndReturn('/getSubjects', { 'gno': groupId });
                    var percentageArr = await postAndReturn('/getAttendanceArr', { 'pno': senderJid })
                    for (var i = 0; i < subjectArr.length; i++) {
                        ws.reply(`Your attendance in ${subjectArr[i]} is ${percentageArr[i]}.`);
                    }
                    break;
                case '.help': case 'menu': case '?':
                    const helpString = `
                    .p <subName>
                    .display
                    .subjects -> to view the abbr. to be used
                    `;
                    ws.reply(helpString);
                    break;
                // case __________________________________
            }
        }
    }
}
