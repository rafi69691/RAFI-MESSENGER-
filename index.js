// ============================================
// 🤖 RAFI BOT - SIMPLE VERSION
// Owner: 100052951819398
// Email:blueberryfree00@gmail.com
// Password:RAFIEXY69
// ============================================

console.log(`
╔══════════════════════════════╗
║      🤖 RAFI BOT STARTING   ║
║      Owner: 100052951819398  ║
╚══════════════════════════════╝
`);

const login = require("fca-unofficial");
const fs = require("fs");

// Configuration
const config = {
    ownerUID: "100052951819398",
    botName: "RAFI BOT 🤖",
    prefix: ".",
    version: "5.0"
};

// Start Bot
function startBot() {
    console.log("🚀 Starting bot...");
    
    const credentials = {
        email: "blueberryfree00@gmail.com",
        password: "RAFIEXY69"
    };
    
    login(credentials, (err, api) => {
        if (err) {
            console.error("❌ Login Error:", err);
            console.log("🔄 Retrying in 30 seconds...");
            setTimeout(startBot, 30000);
            return;
        }
        
        console.log("✅ Login Successful!");
        console.log("🤖 Bot ID:", api.getCurrentUserID());
        
        // Save appstate
        if (!fs.existsSync("appstate.json")) {
            fs.writeFileSync("appstate.json", JSON.stringify(api.getAppState()));
            console.log("💾 AppState saved");
        }
        
        const botInfo = {
            id: api.getCurrentUserID(),
            name: config.botName
        };
        
        api.setOptions({
            listenEvents: true,
            selfListen: false,
            logLevel: "silent"
        });
        
        // Command handler
        const commands = {
            "ping": "🏓 Pong! Bot is alive!",
            "help": `🤖 ${config.botName} Commands:\n\n.ping - Test bot\n.help - Show help\n.owner - Owner info\n.bal - Check balance\n.daily - Daily reward\n.football - Football game`,
            "owner": `👑 BOT OWNER:\n\nID: ${config.ownerUID}\nName: RAFI\nContact: Available`,
            "bal": "💰 Your balance: 1000 coins\nUse .daily to get more!",
            "daily": "🎁 Daily Reward: 100 coins received!",
            "football": () => {
                const players = ["⚽ Messi", "⚽ Ronaldo", "⚽ Neymar", "⚽ Mbappé"];
                return players[Math.floor(Math.random() * players.length)] + "\n✨ Your random football star!";
            }
        };
        
        // Message listener
        api.listenMqtt((err, event) => {
            if (err) return;
            
            if (event.body && event.body.startsWith(config.prefix)) {
                const cmd = event.body.slice(config.prefix.length).toLowerCase();
                
                if (commands[cmd]) {
                    const response = typeof commands[cmd] === 'function' ? commands[cmd]() : commands[cmd];
                    api.sendMessage(response, event.threadID);
                    console.log(`📝 Command: ${cmd} from ${event.senderID}`);
                } else {
                    api.sendMessage(`❓ Unknown command! Use ${config.prefix}help`, event.threadID);
                }
            }
            
            // Welcome message
            if (event.type === 'event' && event.logMessageType === 'log:subscribe') {
                if (event.logMessageData?.addedParticipants?.some(p => p.userFbId === botInfo.id)) {
                    setTimeout(() => {
                        api.sendMessage(
                            `🤖 ${config.botName} is here!\n\n` +
                            `📌 Prefix: ${config.prefix}\n` +
                            `❓ Help: ${config.prefix}help\n` +
                            `👑 Owner: ${config.ownerUID}`,
                            event.threadID
                        );
                    }, 2000);
                }
            }
        });
        
        console.log("🎮 Bot is now listening...");
        console.log(`📌 Prefix: ${config.prefix}`);
        console.log(`👑 Owner: ${config.ownerUID}`);
    });
}

// Error handling
process.on('uncaughtException', (err) => {
    console.error('⚠️ Error:', err);
    setTimeout(startBot, 30000);
});

// Start bot
startBot();
