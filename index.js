// ============================================
// 🤖 RAFI BOT - ADVANCED FIXED VERSION
// Owner: 61555603974360
// ============================================

console.log(`
╔══════════════════════════════════╗
║      🤖 RAFI BOT STARTING       ║
║      Owner: 61555603974360      ║
╚══════════════════════════════════╝
`);

const login = require("fca-unofficial");
const fs = require("fs");

const config = {
    ownerUID: "61555603974360",
    botName: "RAFI BOT 🤖",
    prefix: "."
};

function startBot() {
    console.log("🚀 Starting bot...");
    
    // Credentials - আপনারটা দিয়ে পরিবর্তন করুন
    const CREDENTIALS = {
        email: "blueberryfree00@gmail.com",  // আপনার ইমেইল
        password: "RAFIEXY69"                // আপনার পাসওয়ার্ড
    };
    
    // প্রথমে appstate চেক করুন
    let loginCreds;
    if (fs.existsSync("appstate.json")) {
        try {
            const appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));
            loginCreds = { appState };
            console.log("📁 Using saved appstate.json");
        } catch (e) {
            console.log("❌ Corrupted appstate, using credentials");
            loginCreds = CREDENTIALS;
        }
    } else {
        loginCreds = CREDENTIALS;
        console.log("🔑 Using email/password login");
    }
    
    login(loginCreds, (err, api) => {
        if (err) {
            console.error("❌ LOGIN FAILED!");
            console.error("Error:", err.error || err.message || err);
            
            // Specific error handling
            if (err.error === 'login-approval') {
                console.log("⚠️ 2FA Detected! Create App Password");
                console.log("Go to: facebook.com/settings?tab=security");
                console.log("Then create App Password and use it");
            }
            else if (err.error === 'Wrong username/password.') {
                console.log("❌ Wrong email/password!");
                console.log("Email:", CREDENTIALS.email);
                console.log("Check your credentials");
            }
            else if (err.toString().includes('checkpoint')) {
                console.log("🔒 Account checkpoint! Login via browser first");
            }
            
            console.log("🔄 Retrying in 60 seconds...");
            setTimeout(startBot, 60000);
            return;
        }
        
        // ✅ লগইন সফল
        console.log("✅ LOGIN SUCCESS!");
        console.log("🤖 Bot ID:", api.getCurrentUserID());
        console.log("👤 Bot Name:", api.getCurrentUserID() ? "Loaded" : "Unknown");
        
        // appstate সেভ
        try {
            fs.writeFileSync("appstate.json", JSON.stringify(api.getAppState()));
            console.log("💾 AppState saved");
        } catch (e) {
            console.log("⚠️ Could not save appstate");
        }
        
        runBot(api);
    });
}

function runBot(api) {
    const botInfo = {
        id: api.getCurrentUserID(),
        name: config.botName
    };
    
    api.setOptions({
        listenEvents: true,
        selfListen: false,
        logLevel: "error",  // Changed from "silent"
        updatePresence: false,
        forceLogin: true
    });
    
    console.log("🎮 Setting up bot...");
    
    // Command handler
    const commands = {
        "ping": "🏓 Pong! RAFI Bot is working!",
        "help": `🤖 ${config.botName} v1.0\n\n📌 Commands:\n.ping - Test bot\n.help - This menu\n.owner - Owner info\n.bal - Balance\n.daily - Daily reward\n.football - Game\n\n👑 Owner: ${config.ownerUID}`,
        "owner": `👑 BOT OWNER\n\n• ID: ${config.ownerUID}\n• Name: RAFI\n• Bot: ${config.botName}`,
        "bal": "💰 Balance: 1000 coins\n💸 Daily: .daily",
        "daily": "🎁 Daily Reward: 100 coins added!",
        "football": () => {
            const players = ["⚽ Messi", "⚽ Ronaldo", "⚽ Neymar", "⚽ Mbappé"];
            const player = players[Math.floor(Math.random() * players.length)];
            return `${player}\n✨ Random football star!`;
        },
        "test": "✅ Bot is working! Owner: " + config.ownerUID
    };
    
    // Message listener
    api.listenMqtt((err, event) => {
        if (err) {
            console.error("Listener error:", err);
            return;
        }
        
        // Commands
        if (event.body && event.body.startsWith(config.prefix)) {
            const cmd = event.body.slice(config.prefix.length).toLowerCase().trim();
            
            if (commands[cmd]) {
                const response = typeof commands[cmd] === 'function' ? commands[cmd]() : commands[cmd];
                api.sendMessage(response, event.threadID);
                console.log(`📝 Command: ${cmd} by ${event.senderID}`);
            }
        }
        
        // Welcome
        if (event.type === 'event' && event.logMessageType === 'log:subscribe') {
            if (event.logMessageData?.addedParticipants?.some(p => p.userFbId === botInfo.id)) {
                setTimeout(() => {
                    api.sendMessage(
                        `🤖 ${config.botName} Added!\n\n` +
                        `📌 Prefix: ${config.prefix}\n` +
                        `❓ Help: ${config.prefix}help\n` +
                        `👑 Owner: ${config.ownerUID}\n` +
                        `✅ Ready to use!`,
                        event.threadID
                    );
                }, 2000);
            }
        }
    });
    
    console.log("✅ Bot is now listening!");
    console.log(`📌 Test with: ${config.prefix}ping`);
    console.log(`👑 Owner ID: ${config.ownerUID}`);
    console.log("🚀 Bot started successfully!");
}

// Error handling
process.on('uncaughtException', (error) => {
    console.error("⚠️ Critical error:", error.message);
    console.log("🔄 Auto-restart in 30 seconds...");
    setTimeout(startBot, 30000);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error("⚠️ Unhandled rejection:", reason);
});

// Start
startBot();
