const { default: makeWASocket, useSingleFileAuthState, jidNormalizedUser } = require("@adiwajshing/baileys");
const { state } = useSingleFileAuthState('./sesi.json');

const pino = require('pino');

function startBot(){

    try {

        const ws = makeWASocket({
            logger: pino({ level: 'silent' }),
            browser: ["Ramesh", "Ramesh-Connections", "1.0"],
            auth: state
        })
        require('./abstractions/interactionFunctions.js')(ws);

        if (ws.user && ws.user.id) ws.user.jid = jidNormalizedUser(ws.user.id)
        // _______________________________________________________________

        ws.ev.on('connection.update', async (update) => {
            const { connection } = update;
            try {
                if (connection === "open") {
                    console.log("Connection Successful!");
                    ws.sendMessage("918815065180@s.whatsapp.net", { text: 'Connected Successfully' })
                }
                else if (connection === "close") {
                    console.log("Connection Failed");
                    startBot();
                }
            } catch (err) {
                console.log('connection.update error' + err)
                startBot();
            }
        })

        // ______________________________________________________________
        ws.ev.on('messages.upsert', async chatUpdate => {
            try {
                require('./features/applicationLogic.js')(ws, chatUpdate);
            } catch (err) {
                console.log(err)
            }
        })

        // _______________________________________________________________
        // listen every X minutes for updates on the college website

        const { checkAndReturn } = require('./features/updates/getUpdates.js');
        const pathOfDump = "./data.json";

        const main = async () => {
            const result = await checkAndReturn(pathOfDump);
            const res = await fetch('https://alert-bot.vercel.app/groupIds');
            // console.log(res.body);
            let groupArr = await res.text();
            groupArr = await JSON.parse(groupArr);
            groupArr = groupArr.groupIds;
            console.log(groupArr);
            if (result) {
                for (const i of result){
                    for(const jid of groupArr){
                        // implement better way using axios headers and content-type['application/pdf'] checking
                        try {
                            if(i.link.slice(-4) == ".pdf"){
                                await ws.sendFile(jid, i.link, i.innerText);
                                await ws.sendMessage(jid, { text: `Brought to you by https://alert-bot.vercel.app` })
                            } else if (i.link.slice(-4) == ".jpg") {
                                await ws.sendImage(jid, i.link, i.innerText);
                                await ws.sendMessage(jid, { text: `Brought to you by https://alert-bot.vercel.app` })
                            } else {
                                await ws.sendMessage(jid, { text: `${i.innerText}, Link: ${i.link}` })
                                await ws.sendMessage(jid, { text: `Brought to you by https://alert-bot.vercel.app` })
                            }
                        } catch (err) {
                            console.log("Error sending result data" + err);
                            startBot();
                        }
                    }
                }
                return;
            }
            return;
        }

        // call main every 15 minutes
        const x = 60 / 60;
        main();
        setInterval(main, x * 60 * 1000);

    } catch (err) {
        console.log(err);
        startBot();
    }

}

startBot();
