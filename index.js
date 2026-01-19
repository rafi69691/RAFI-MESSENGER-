// ============================================
// 🤖 RAFI BOT - SECURE VERSION
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
    
    // WARNING: Hardcoded credentials are NOT secure!
    // Use environment variables instead
    const CREDENTIALS = {
        email: process.env.FB_EMAIL || "blueberryfree00@gmail.com",  // পরিবর্তন: environment variable ব্যবহার
        password: process.env.FB_PASSWORD || "RAFIEXY69"
    };
    
    if (!CREDENTIALS.email || !CREDENTIALS.password) {
        console.error("❌ ERROR: FB_EMAIL or FB_PASSWORD not set!");
        console.log("ℹ️ Please set environment variables:");
        console.log("FB_EMAIL=your_email@example.com");
        console.log("FB_PASSWORD=your_password");
        console.log("🔄 Exiting...");
        process.exit(1);
    }
    
    // appstate চেক
    let loginCreds;
    if (fs.existsSync("appstate.json")) {
        try {
            const appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));
            if (appState && Array.isArray(appState) && appState.length > 0) {
                loginCreds = { appState };
                console.log("📁 Using saved appstate.json");
            } else {
                throw new Error("Invalid appstate");
            }
        } catch (e) {
            console.log("⚠️ Corrupted appstate, using credentials");
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
                console.log("⚠️ 2FA Detected!");
                console.log("Please login via browser first to verify");
            }
            else if (err.error === 'Wrong username/password.') {
                console.log("❌ Wrong email/password!");
            }
            else if (err.toString().includes('checkpoint')) {
                console.log("🔒 Account checkpoint detected!");
                console.log("Please login via browser to verify");
            }
            
            console.log("🔄 Retrying in 60 seconds...");
            setTimeout(startBot, 60000);
            return;
        }
        
        // ✅ লগইন সফল
        console.log("✅ LOGIN SUCCESS!");
        console.log("🤖 Bot ID:", api.getCurrentUserID());
        
        // appstate সেভ
        try {
            const appState = api.getAppState();
            if (appState) {
                fs.writeFileSync("appstate.json", JSON.stringify(appState));
                console.log("💾 AppState saved");
            }
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
        logLevel: "error",
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
        "test": "✅ Bot is working!"
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
                try {
                    const response = typeof commands[cmd] === 'function' 
                        ? commands[cmd]() 
                        : commands[cmd];
                    api.sendMessage(response, event.threadID);
                    console.log(`📝 Command: ${cmd} from ${event.senderID}`);
                } catch (e) {
                    console.error("Command error:", e);
                }
            }
        }
        
        // Welcome
        if (event.type === 'event' && event.logMessageType === 'log:subscribe') {
            const added = event.logMessageData?.addedParticipants || [];
            if (added.some(p => p.userFbId === botInfo.id)) {
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
