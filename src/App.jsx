 import React, { useState, useEffect, useRef } from 'react';
import { ethers, JsonRpcProvider, formatUnits } from 'ethers';

// --- NETWORK CONFIGURATION ---
const CONTRACT_ADDRESS = "0xeA65E6DFd67c044a2DEc0a1B7C95a99FFFF131b5";
const NFT_CONTRACT_ADDRESS = "0xb18c8Ac9b0FB347D91970eD2eb9B3a31852673dC";
const TEMPO_CHAIN_ID = '0xa5bd';
const RPC_URL = "https://rpc.testnet.tempo.xyz";
const EXPLORER_URL = "https://explore.tempo.xyz/tx/";

const TOKEN_CONTRACTS = {
AlphaUSD: "0x20c0000000000000000000000000000000000001",
BetaUSD: "0x20c0000000000000000000000000000000000002",
ThetaUSD: "0x20c0000000000000000000000000000000000003"
};

const ABI = [
"function stealFlag(string calldata taunt) external",
"function currentBearer() public view returns (address)",
"function currentTaunt() public view returns (string)",
"event FlagStolen(address indexed thief, address indexed victim, string taunt, uint256 durationHeld)"
];

const ERC20_ABI = [
"function balanceOf(address owner) view returns (uint256)",
"function decimals() view returns (uint8)",
"function symbol() view returns (string)"
];

const NFT_ABI = ["function mint(address to) public"];

const MISSION_TEXTS = [
{ lang: "EN", text: "Engage in a relentless battle for network supremacy. Seize the digital flag and hold your ground at the daily snapshot (00:00 UTC) to immortalize your victory with an exclusive NFT drop." },
{ lang: "BASH", text: "$ sudo capture_flag --target=network_supremacy --hold_until=00:00_UTC && ./mint_exclusive_nft.sh --force" },
{ lang: "1337", text: "3NG4G3 1N 4 R3L3N7L355 B477L3. 531Z3 7H3 D1G174L FL4G & H0LD Y0UR GR0UND 47 00:00 U7C 70 IMM0R74L1Z3 Y0UR V1C70RY W17H 4N NF7 DR0P." },
{ lang: "SQL", text: "SELECT * FROM victories WHERE flag_holder = CURRENT_USER AND time = '00:00 UTC'; INSERT INTO wallet (reward) VALUES ('Speed Demon NFT');" },
{ lang: "JS", text: "const mission = () => { if(flag.owner === me && time === '00:00 UTC') { return mintNFT('Speed Demon'); } else { battle.continue(); } };" },
{ lang: "HEX", text: "0x45 0x6E 0x67 0x61 0x67 0x65 0x20 0x50 0x72 0x6F 0x74 0x6F 0x6C 0x3A 0x20 0x53 0x45 0x49 0x5A 0x45 0x5F 0x46 0x4C 0x41 0x47" },
{ lang: "JSON", text: "{ \"objective\": \"dominance\", \"target\": \"flag\", \"condition\": \"hold_at_0000_UTC\", \"reward\": \"exclusive_nft\", \"status\": \"pending\" }" },
{ lang: "ASM", text: "MOV AX, FLAG_STATUS / CMP AX, CAPTURED / JNE RETRY / CALL MINT_NFT / HLT" },
{ lang: "B64", text: "U2VpemUgdGhlIGZsYWcuIEhvbGQgdW50aWwgMDA6MDAgVVRDLiBXaW4gdGhlIE5GVC4=" },
{ lang: "ROT13", text: "Rantntr va n eryragyrff onggyr sbe argjbex fhcerznpl. Frvmr gur qvtvgny synt naq ubyq lbhe tebhaq ng 00:00 HGP." },
{ lang: "LOG", text: "[SYSTEM_INIT]: Battle_Mode=ACTIVE. [OBJECTIVE]: Capture_Flag. [TIME_CONSTRAINT]: 00:00_UTC. [REWARD]: NFT_Asset_Class_S." },
{ lang: "BIN", text: "01010011 01000101 01001001 01011010 01000101 00100000 01010100 01001000 01000101 00100000 01010100 01001000 01000101 00100000 01000110 01001100 01000001 01000111" },
{ lang: "GLITCH", text: "E̶n̶g̶a̶g̶e̶ ̶i̶n̶ ̶b̶a̶t̶t̶l̶e̶.̶ ̶S̶e̶i̶z̶e̶ ̶t̶h̶e̶ ̶F̶L̶A̶G̶.̶ ̶D̶o̶m̶i̶n̶a̶t̶e̶ ̶0̶0̶:̶0̶0̶.̶" },
{ lang: "REV", text: ".pord TFN evisulcxe na htiw yrotciv ruoy ezilatrommi ot )CTU 00:00( tohspans yliad eht ta dnuorg ruoy dloh dna galf latigid eht ezieS" },
{ lang: "CPP", text: "void win() { while(time != '00:00') { fight(); } flag.owner = this; mint(NFT); }" }
];

const TEMPO_FACTS = [
"FACT: Tempo uses pathUSD for gas fees, ensuring predictable transaction costs.",
"FACT: Engineered for massive scalability by Stripe and Paradigm.",
"FACT: Tempo features an Enshrined AMM for protocol-level swap efficiency.",
"FACT: Dedicated Payment Lanes isolate transfer traffic from network congestion.",
"FACT: Tempo is fully EVM-compatible and optimized for sub-second finality.",
"FACT: Designed for institutional finance with native compliance modules.",
"FACT: Tempo targets zero-latency financial velocity at global scale.",
"FACT: Deterministic payment paths significantly reduce failed transactions."
];

const VICTORY_MESSAGES = [
"CATCH ME IF YOU CAN!", "I AM THE SPEED.", "TEMPO KING HAS ARRIVED.",
"MAXIMUM VELOCITY REACHED.", "PURE ADRENALINE.", "NEED FOR SPEED.",
"ZERO LATENCY, INFINITE GLORY.", "SPEED DEMON ONLINE.", "GAS GAS GAS!",
"SONIC BOOM!", "NO BRAKES, ONLY GAS.", "HYPERDRIVE ENGAGED.",
"THE THRONE IS MINE.", "BLOCKCHAIN DOMINATION.", "KING OF THE HILL.",
"PROOF OF VELOCITY: VERIFIED.", "TRANSACTION CONFIRMED.", "SMART CONTRACT KING.",
"CODE IS LAW, I AM KING.", "CONSENSUS REACHED: I WIN.", "SYNCING... VICTORY.",
"404: RIVAL NOT FOUND.", "ACCESS GRANTED.", "SYSTEM OVERRIDE.", "LATENCY: 0MS.",
"PACKET LOSS: ZERO.", "BANDWIDTH: INFINITE.", "ENCRYPTION: UNBREAKABLE."
];

const PLAYLIST = [
{ title: "Enthusiast", artist: "Tours", genre: "UPBEAT", url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3" },
{ title: "Sentinel", artist: "Kai Engel", genre: "CYBERPUNK", url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kai_Engel/Satin/Kai_Engel_-_04_-_Sentinel.mp3" },
{ title: "Algorithms", artist: "Chad Crouch", genre: "TECH", url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Algorithms.mp3" },
{ title: "Night Owl", artist: "Broke For Free", genre: "CHILL", url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3" }
];

const SYSTEM_CHATTER = [
"Scanning for intelligent life... 0 found.",
"Downloading more RAM...",
"Ordering pizza via smart contract...",
"Searching for Satoshi...",
"Error 418: I'm a teapot.",
"Refilling pathUSD tank...",
"Mining comedy gold...",
"Calibrating flux capacitor...",
"Defragmenting reality...",
"Updating drivers (99% forever)...",
"Checking pulse of the network...",
"Ping: 9999ms (Just kidding)...",
"Installing patience.exe...",
"Optimizing dopamine receptors...",
"Skynet is watching you.",
"Cleaning up blockchain dust...",
"Syncing with the matrix...",
"Looking for the 'Any' key...",
"Yield farming digital carrots...",
"Establishing uplink to Mars...",
"Compiling victory...",
"Loading witty comment...",
"Buffering awesome experience...",
"Generating random entropy...",
"Detecting high levels of awesome.",
"Keyboard not found. Press F1 to continue.",
"Simulation running at 100% capacity."
];

const GLOBAL_CSS = `
html, body { margin: 0; padding: 0; width: 100vw; height: 100vh; background-color: #020204; overflow: hidden; user-select: none; }
*:focus-visible { outline: 2px solid #00f3ff; outline-offset: 2px; }
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #111; }
::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }

.scanlines { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size: 100% 2px, 3px 100%; pointer-events: none; z-index: 9999; }
.space-background { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; background-image: radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px), radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 2px); background-size: 550px 550px, 350px 350px; pointer-events: none; opacity: 0.5; }
.tx-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; z-index: 2; }
.tx-star { position: absolute; color: #00f3ff; font-family: 'Courier New', monospace; font-size: 11px; white-space: nowrap; cursor: pointer; pointer-events: auto; background: rgba(0, 20, 40, 0.4); border: 1px solid rgba(0, 243, 255, 0.2); padding: 5px 10px; border-radius: 4px; opacity: 0.75; filter: blur(0.5px); text-shadow: 0 0 5px rgba(0, 243, 255, 0.4); transition: all 0.3s ease; }
.tx-star:hover { background: #00f3ff; color: #000; border-color: #fff; z-index: 50; opacity: 1; filter: blur(0px); box-shadow: 0 0 15px #00f3ff; transform: scale(1.2); }
@keyframes floatRight { 0% { left: -300px; opacity: 0.75; } 90% { opacity: 0.75; } 100% { left: 120vw; opacity: 0; } }
.retro-grid { position: fixed; width: 200%; height: 100%; bottom: -50%; left: -50%; background-image: linear-gradient(#2c002c 2px, transparent 2px), linear-gradient(90deg, #2c002c 2px, transparent 2px); background-size: 50px 50px; background-position: center bottom; transform: perspective(500px) rotateX(60deg); animation: moveGrid 5s linear infinite; opacity: 0.2; z-index: 1; pointer-events: none; }
@keyframes moveGrid { from { transform: perspective(500px) rotateX(60deg) translateY(0); } to { transform: perspective(500px) rotateX(60deg) translateY(50px); } }
.pro-console { background: rgba(5, 5, 10, 0.95); border: 2px solid #333; border-top: 2px solid #555; border-bottom: 4px solid #00f3ff; border-radius: 8px 8px 4px 4px; width: 95%; max-width: 750px; display: flex; flex-direction: column; position: relative; z-index: 100; margin-bottom: 20px; box-shadow: 0 0 40px rgba(0,0,0,0.8); backdrop-filter: blur(10px); animation: console-breathe 4s infinite alternate; }
@keyframes console-breathe { 0% { box-shadow: 0 0 20px rgba(0, 243, 255, 0.1); } 100% { box-shadow: 0 0 40px rgba(0, 243, 255, 0.3), 0 0 10px rgba(255, 0, 255, 0.2); } }
.console-header { background: #15151a; color: #888; padding: 12px 20px; font-size: 0.7rem; border-bottom: 1px solid #333; display: flex; justify-content: space-between; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; border-radius: 6px 6px 0 0; }
.pilot-info { text-align: center; padding: 15px; color: #aaa; font-size: 0.75rem; border-bottom: 1px solid #222; background: rgba(0,0,0,0.3); }

.net-diag-bar { display: flex; justify-content: space-around; align-items: center; background: #08080c; border-bottom: 1px solid #333; padding: 8px; font-family: 'Courier New', monospace; font-size: 0.6rem; color: #555; }
.diag-item { display: flex; align-items: center; gap: 5px; }
.live-dot { width: 6px; height: 6px; border-radius: 50%; background: #333; margin-right: 2px; }
.live-dot.active { background: #39ff14; box-shadow: 0 0 5px #39ff14; animation: blinker 1s infinite; }
.diag-val { color: #fff; font-weight: bold; margin-left: 2px; }

.info-grid { display: flex; flex-direction: column; gap: 15px; padding: 20px; }
@media (min-width: 600px) { .info-grid { flex-direction: row; align-items: center; } }
.holo-section { flex: 1; display: flex; justify-content: center; align-items: center; padding: 10px; background: rgba(0, 243, 255, 0.03); border: 1px solid #333; border-radius: 4px; }
.data-section { flex: 2; display: flex; flex-direction: column; gap: 15px; }
.data-block { background: #0a0a0f; border: 1px solid #333; padding: 15px; border-left: 4px solid #333; transition: border-color 0.3s; }
.data-block:hover { border-left-color: #00f3ff; }
.data-label { color: #666; font-size: 0.6rem; display: block; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;}
.data-value { color: #fff; font-size: 0.9rem; word-break: break-all; line-height: 1.5; font-family: 'Courier New', monospace; font-weight: bold; }
.message-text { color: #ff00ff; font-size: 1rem; font-style: italic; text-shadow: 0 0 5px rgba(255, 0, 255, 0.4); }

.action-area { padding: 0 20px 20px 20px; }
.tactical-combo { display: flex; gap: 5px; height: 65px; margin-bottom: 10px; }
.action-btn.main { flex: 3; background: linear-gradient(90deg, #00f3ff, #0099ff); color: #000; border: none; border-radius: 4px; font-family: "Press Start 2P", cursive; font-weight: bold; font-size: 0.9rem; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; transition: all 0.2s; box-shadow: 0 5px 20px rgba(0, 243, 255, 0.2); }
.action-btn.main:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0, 243, 255, 0.5); filter: brightness(1.1); }
.action-btn.main:disabled { background: #444; cursor: not-allowed; box-shadow: none; transform: none; color: #888; }

.gas-settings-btn { flex: 1; position: relative; background: #111; border: 1px solid #333; border-radius: 4px; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; transition: all 0.2s; min-width: 95px; }
.gas-settings-btn:hover { background: #1a1a1a; border-color: #00f3ff; }
.gas-label-top { font-size: 0.5rem; color: #888; margin-bottom: 4px; letter-spacing: 1px; }
.gas-value-display { display: flex; align-items: center; gap: 5px; font-family: "Press Start 2P", cursive; font-size: 0.7rem; color: #fff; }
.dropdown-arrow { font-size: 0.5rem; color: #00f3ff; }

.gas-dropdown-menu { position: absolute; bottom: 110%; right: 0; width: 220px; background: #0a0a0f; border: 1px solid #00f3ff; border-radius: 4px; box-shadow: 0 0 20px rgba(0,0,0,0.9); z-index: 500; display: flex; flex-direction: column; overflow: hidden; animation: fadeUp 0.2s ease-out; }
.gas-option { padding: 15px; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: background 0.2s; }
.gas-option:last-child { border-bottom: none; }
.gas-option:hover { background: rgba(0, 243, 255, 0.1); }
.gas-option.selected { background: rgba(0, 243, 255, 0.05); border-left: 3px solid #00f3ff; }
.opt-symbol { font-family: "Press Start 2P", cursive; font-size: 0.6rem; color: #fff; }
.opt-balance { font-family: 'Courier New', monospace; font-size: 0.7rem; color: #888; font-weight: bold; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.broadcast-section { margin-top: 15px; animation: slideDown 0.5s ease-out; }
.twitter-btn { width: 100%; padding: 15px; background: #1DA1F2; color: #fff; border: none; border-radius: 4px; font-family: "Press Start 2P", cursive; font-size: 0.8rem; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px; text-transform: uppercase; transition: all 0.2s; box-shadow: 0 0 15px rgba(29, 161, 242, 0.4); }
.twitter-btn:hover { background: #0c85d0; transform: scale(1.02); box-shadow: 0 0 25px rgba(29, 161, 242, 0.6); }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

.message-display-box { background: #000; border: 1px solid #444; border-radius: 4px; display: flex; margin-bottom: 10px; align-items: stretch; box-shadow: inset 0 0 10px rgba(0,0,0,0.8); }
.taunt-readout { flex: 1; background: #050505; color: #00f3ff; font-family: "Press Start 2P", cursive; font-size: 0.65rem; padding: 20px; display: flex; align-items: center; border-right: 1px solid #333; overflow: hidden; white-space: nowrap; text-shadow: 0 0 5px rgba(0, 243, 255, 0.3); }
.reroll-btn { background: #ffe600; color: #000; border: none; cursor: pointer; padding: 0 20px; font-size: 0.8rem; font-family: "Press Start 2P", cursive; font-weight: bold; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.2s; animation: attention-pulse 2s infinite; }
.reroll-btn:hover { background: #fff; transform: scale(1.02); }
@keyframes attention-pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 230, 0, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(255, 230, 0, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 230, 0, 0); } }

.helper-text { text-align: center; color: #666; font-size: 0.6rem; margin-top: 15px; font-family: monospace; }
.system-log-footer { background: #000; border-top: 1px solid #333; padding: 15px 20px; font-size: 0.65rem; color: #555; min-height: 25px; display: flex; align-items: center; font-family: 'Courier New', monospace; font-weight: bold; border-radius: 0 0 6px 6px; }
.log-blink { animation: blinker 1s infinite; color: #ff3333; }

.battle-log-container { width: 95%; max-width: 750px; background: #050505; border: 1px solid #333; border-top: 2px solid #00f3ff; padding: 10px; margin-top: 20px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 0.65rem; }
.battle-log-header { color: #00f3ff; font-weight: bold; margin-bottom: 10px; border-bottom: 1px dashed #333; padding-bottom: 5px; }
.log-entry { margin-bottom: 5px; color: #888; border-left: 2px solid #333; padding-left: 8px; }
.log-entry.new { color: #fff; border-left-color: #39ff14; animation: fadeIn 0.5s; }
.log-time { color: #555; margin-right: 8px; }
.log-addr { color: #ff00ff; font-weight: bold; }
@keyframes fadeIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }

.holo-ring { width: 100px; height: 100px; border: 2px dashed #00f3ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: spin-slow-cw 10s linear infinite; box-shadow: 0 0 20px rgba(0, 243, 255, 0.2); }
.pixel-trophy-icon { width: 55px; height: 55px; filter: drop-shadow(0 0 10px #FFD700); animation: glow-pulse 2s infinite alternate; }
.owned .holo-ring { border-color: #FFD700; box-shadow: 0 0 30px #FFD700; }
@keyframes spin-slow-cw { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes glow-pulse { 0% { filter: drop-shadow(0 0 5px #FFD700); transform: scale(1); } 100% { filter: drop-shadow(0 0 15px #FFD700); transform: scale(1.05); } }

.mission-container { width: 95%; max-width: 750px; margin-bottom: 25px; display: flex; gap: 10px; align-items: center; background: rgba(0,0,0,0.6); padding: 20px; border: 1px solid #333; border-radius: 6px; box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
.mission-text { flex: 1; font-family: 'Courier New', monospace; font-size: 0.8rem; color: #fff; line-height: 1.6; text-shadow: 0 0 5px rgba(255,255,255,0.2); }
.mission-lang-tag { color: #00f3ff; font-weight: bold; margin-right: 10px; }
.translate-btn { background: transparent; border: 1px solid #00f3ff; color: #00f3ff; font-family: "Press Start 2P", cursive; font-size: 0.6rem; padding: 15px; cursor: pointer; transition: all 0.2s; white-space: nowrap; text-transform: uppercase; }
.translate-btn:hover { background: #00f3ff; color: #000; box-shadow: 0 0 10px #00f3ff; }
.translate-btn:active { transform: scale(0.95); }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 9000; display: flex; justify-content: center; alignItems: center; backdrop-filter: blur(8px); }
.modal-box { background: #111; border: 4px solid #FFD700; padding: 40px; max-width: 500px; width: 90%; text-align: center; box-shadow: 0 0 50px rgba(255, 215, 0, 0.4); position: relative; animation: popIn 0.3s ease; }
.modal-close { position: absolute; top: 10px; right: 15px; color: #666; cursor: pointer; font-size: 20px; background: none; border: none; }
.modal-close:hover { color: #fff; }
.victory-box {
text-align: center; background: rgba(5, 5, 10, 0.95);
border: 4px solid #39ff14; padding: 50px;
box-shadow: 0 0 100px rgba(57, 255, 20, 0.5), inset 0 0 30px rgba(57, 255, 20, 0.2);
animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
position: relative; overflow: hidden;
max-width: 600px; width: 90%;
}
.victory-title {
font-size: 2.5rem; color: #39ff14;
text-shadow: 0 0 20px #39ff14;
margin-bottom: 20px; animation: glow-pulse 1s infinite alternate;
}
.victory-icon { font-size: 6rem; margin: 20px 0; filter: drop-shadow(0 0 30px #FFD700); animation: spin-slow-cw 20s infinite linear; }
@keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }
.gold-btn { margin-top: 15px; background: linear-gradient(to bottom, #FFD700, #B8860B); color: #000; border: 2px solid #fff; padding: 12px 24px; font-family: "Press Start 2P", cursive; font-size: 0.7rem; font-weight: bold; cursor: pointer; box-shadow: 0 0 15px #FFD700, inset 0 0 10px #fff; transition: all 0.2s; z-index: 200; text-transform: uppercase; letter-spacing: 1px; }
.gold-btn:hover { transform: scale(1.05); background: linear-gradient(to bottom, #FFF, #FFD700); box-shadow: 0 0 30px #FFD700, inset 0 0 20px #fff; }

.mystery-box { width: 180px; height: 180px; margin: 30px auto; background: #FFD700; box-shadow: inset 5px 5px 0px #FFFF00, inset -5px -5px 0px #B8860B, 0 0 30px #FFD700; position: relative; display: flex; justify-content: center; align-items: center; animation: floatBox 2s infinite ease-in-out; }
.mystery-box::before { content: ''; position: absolute; width: 100%; height: 30px; background: #ff0000; }
.mystery-box::after { content: ''; position: absolute; width: 30px; height: 100%; background: #ff0000; }
.mystery-text { z-index: 2; font-size: 80px; color: #fff; text-shadow: 3px 3px 0 #000; font-weight: bold; }
@keyframes floatBox { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

.footer-facts { margin-top: 30px; margin-bottom: 50px; text-align: center; font-family: 'Courier New', monospace; font-size: 0.7rem; color: #00f3ff; background: rgba(0, 243, 255, 0.05); padding: 10px 20px; border-radius: 20px; border: 1px solid rgba(0, 243, 255, 0.2); max-width: 80%; }
.radio-station { width: 180px; position: fixed; bottom: 20px; right: 20px; background: rgba(10, 10, 10, 0.95); border: 2px solid #ff00ff; border-radius: 8px; padding: 10px; z-index: 5000; font-family: "Press Start 2P", cursive; box-shadow: 0 0 15px rgba(255, 0, 255, 0.3); display: flex; flex-direction: column; gap: 10px; transition: opacity 0.3s; }
.station-screen { height: 30px; background: #222; border: 1px inset #555; padding: 5px; color: #00f3ff; font-size: 6px; line-height: 1.5; text-align: center; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; }
.visualizer-container { position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: flex-end; justify-content: space-between; padding: 0 2px; opacity: 0.3; pointer-events: none; }
.viz-bar { width: 8%; background: #ff00ff; animation: equalize 0.5s infinite; }
.viz-bar:nth-child(even) { animation-duration: 0.4s; background: #00f3ff; }
.viz-bar:nth-child(3n) { animation-duration: 0.3s; }
@keyframes equalize { 0% { height: 10%; } 50% { height: 80%; } 100% { height: 10%; } }
.controls-row { display: flex; justify-content: space-between; align-items: center; gap: 5px; }
.radio-btn { font-size: 7px; padding: 5px 0; background: #333; border: 1px solid #666; color: #fff; cursor: pointer; flex: 1; text-align: center; border-radius: 4px; transition: background 0.2s; }
.volume-slider { width: 100%; cursor: pointer; accent-color: #00f3ff; height: 4px; margin-top: 5px; }

.confetti-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; z-index: 1; }
.confetti-piece { position: absolute; top: -10px; width: 10px; height: 10px; background: #FFD700; animation: fall linear forwards; }
@keyframes fall { to { transform: translateY(100vh) rotate(720deg); } }
`;

const Confetti = () => {
const pieces = Array.from({ length: 50 }).map((_, i) => {
const left = Math.random() * 100 + '%';
const delay = Math.random() * 2 + 's';
const duration = Math.random() * 3 + 2 + 's';
const bg = ['#FFD700', '#00f3ff', '#ff00ff', '#39ff14'][Math.floor(Math.random() * 4)];
return (
<div
key={i}
className="confetti-piece"
style={{ left, animationDelay: delay, animationDuration: duration, backgroundColor: bg }}
/>
);
});
return <div className="confetti-container">{pieces}</div>;
};

const SuccessOverlay = ({ onClose, isMintAction, txHash }) => (
<div style={styles.overlay} role="alertdialog">
<div className="victory-box" style={{ borderColor: isMintAction ? '#FFD700' : '#39ff14' }}>
<Confetti />
<h1 className="victory-title" style={{ color: isMintAction ? '#FFD700' : '#39ff14' }}>
{isMintAction ? "NFT SECURED" : "NEW KING DETECTED"}
</h1>
<div className="victory-icon">{isMintAction ? "🎨" : "🏆"}</div>
<p style={{color: '#fff', fontSize: '1rem', marginBottom: '20px', letterSpacing: '2px'}}>
{isMintAction ? "WINNER NFT SUCCESSFULLY MINTED" : "FLAG SECURED. NETWORK DOMINATED."}
</p>

{isMintAction && txHash && (
<button
onClick={() => window.open(EXPLORER_URL + txHash, '_blank')}
className="gold-btn"
style={{marginBottom: '10px', width: '100%', cursor: 'pointer'}}
>
VIEW TRANSACTION
</button>
)}

<button onClick={onClose} style={styles.actionButton}>
{isMintAction ? "CONFIRM" : "RETURN TO CONSOLE"}
</button>
</div>
</div>
);

const BattleFeed = () => {
const [logs, setLogs] = useState([
{ id: 1, time: "12:00:01", addr: "0xSystem", msg: "Data Uplink Active" },
{ id: 2, time: "12:05:32", addr: "0x71...A9", msg: "New Flag Bearer Detected" }
]);

useEffect(() => {
const interval = setInterval(() => {
const isSystemMsg = Math.random() > 0.6;
let newLog;
if (isSystemMsg) {
newLog = {
id: Date.now(),
time: new Date().toLocaleTimeString('en-US', {hour12:false, hour:"2-digit", minute:"2-digit", second:"2-digit"}),
addr: "CORE_SYSTEM",
msg: SYSTEM_CHATTER[Math.floor(Math.random() * SYSTEM_CHATTER.length)],
isSystem: true
};
} else {
const fakeAddr = "0x" + Math.floor(Math.random()*16777215).toString(16).substring(0,4) + "..." + Math.floor(Math.random()*16777215).toString(16).substring(0,2);
newLog = {
id: Date.now(),
time: new Date().toLocaleTimeString('en-US', {hour12:false, hour:"2-digit", minute:"2-digit", second:"2-digit"}),
addr: fakeAddr,
msg: ["ACCESS DENIED", "MAX VELOCITY", "OVERRIDE COMPLETE", "FLAG CAPTURED", "NODE SYNCED"][Math.floor(Math.random()*5)],
isSystem: false
};
}
setLogs(prev => [newLog, ...prev].slice(0, 5));
}, 4000);
return () => clearInterval(interval);
}, []);

return (
<div className="battle-log-container">
<div className="battle-log-header">📡 LIVE NETWORK FEED</div>
{logs.map(log => (
<div key={log.id} className="log-entry new">
<span className="log-time">[{log.time}]</span>
<span className="log-addr" style={{color: log.isSystem ? '#888' : '#ff00ff'}}>{log.addr}</span>: {log.msg}
</div>
))}
</div>
);
};

const TacticalActionArea = ({ account, isLoading, handleSteal }) => {
const [isOpen, setIsOpen] = useState(false);
const [selectedToken, setSelectedToken] = useState('pathUSD');
const [balances, setBalances] = useState({ pathUSD: '0', AlphaUSD: '0', BetaUSD: '0', ThetaUSD: '0' });
const [stopwatch, setStopwatch] = useState(null);

useEffect(() => {
let interval;
if(isLoading) {
const startTime = Date.now();
interval = setInterval(() => {
setStopwatch(((Date.now() - startTime) / 1000).toFixed(2) + "s");
}, 50);
} else {
setStopwatch(null);
}
return () => clearInterval(interval);
}, [isLoading]);

useEffect(() => {
if (!account) return;
const fetchBalances = async () => {
try {
const provider = new ethers.BrowserProvider(window.ethereum);
const pathBal = await provider.getBalance(account);
let newBalances = { pathUSD: parseFloat(formatUnits(pathBal, 18)).toFixed(2) };
for (const [key, address] of Object.entries(TOKEN_CONTRACTS)) {
try {
const contract = new ethers.Contract(address, ERC20_ABI, provider);
const rawBalance = await contract.balanceOf(account);
newBalances[key] = parseFloat(formatUnits(rawBalance, 18)).toFixed(2);
} catch (e) { newBalances[key] = '0.00'; }
}
setBalances(newBalances);
} catch (err) {}
};
fetchBalances();
const interval = setInterval(fetchBalances, 5000);
return () => clearInterval(interval);
}, [account]);

const selectToken = (token) => {
setSelectedToken(token);
setIsOpen(false);
};

const getSymbol = (token) => {
if (token === 'AlphaUSD') return 'αUSD';
if (token === 'BetaUSD') return 'βUSD';
if (token === 'ThetaUSD') return 'θUSD';
return token;
};

return (
<div className="tactical-combo">
<button
className="action-btn main"
onClick={handleSteal}
disabled={isLoading}
>
{isLoading ? `PROCESSING... [${stopwatch}]` : "CLAIM THE FLAG"}
</button>

<div className="gas-settings-btn" onClick={() => setIsOpen(!isOpen)}>
<span className="gas-label-top">FEE ASSET:</span>
<div className="gas-value-display">
<span className="gas-symbol">{getSymbol(selectedToken)}</span>
<span className="dropdown-arrow">▼</span>
</div>
{isOpen && (
<div className="gas-dropdown-menu">
<div className={`gas-option ${selectedToken === 'pathUSD' ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); selectToken('pathUSD'); }}>
<span className="opt-symbol">pathUSD</span>
<span className="opt-balance">{account ? balances.pathUSD : '0.00'}</span>
</div>
{Object.keys(TOKEN_CONTRACTS).map(token => (
<div
key={token}
className={`gas-option ${selectedToken === token ? 'selected' : ''}`}
onClick={(e) => { e.stopPropagation(); selectToken(token); }}
>
<span className="opt-symbol">{getSymbol(token)}</span>
<span className="opt-balance">{account ? balances[token] : '0.00'}</span>
</div>
))}
</div>
)}
</div>
</div>
);
};

const NetworkHUD = () => {
const [blockHeight, setBlockHeight] = useState(0);
const [latency, setLatency] = useState(0);
const [isOnline, setIsOnline] = useState(false);

useEffect(() => {
const fetchMetrics = async () => {
try {
const start = Date.now();
const provider = new JsonRpcProvider(RPC_URL);
const block = await provider.getBlockNumber();
const end = Date.now();
setBlockHeight(block);
setLatency(end - start);
setIsOnline(true);
} catch (e) {
setIsOnline(false);
}
};

fetchMetrics();
const interval = setInterval(fetchMetrics, 3000);
return () => clearInterval(interval);
}, []);

return (
<div className="net-diag-bar">
<div className="diag-item">
<div className={`live-dot ${isOnline ? 'active' : ''}`}></div>
GATEWAY: <span className="diag-val" style={{color: isOnline ? '#39ff14' : 'red'}}>{isOnline ? "ACTIVE" : "OFFLINE"}</span>
</div>
<div className="diag-item">
PING: <span className="diag-val" style={{color: latency < 150 ? '#39ff14' : latency < 300 ? 'yellow' : 'red'}}>{latency}ms</span>
</div>
<div className="diag-item">
LATEST BLOCK: <span className="diag-val">{blockHeight > 0 ? `#${blockHeight}` : "INITIALIZING..."}</span>
</div>
</div>
);
};

const MissionBriefing = ({ langIndex, onTranslate }) => (
<div className="mission-container">
<div className="mission-text">
<span className="mission-lang-tag">[{MISSION_TEXTS[langIndex].lang}]:</span>
{MISSION_TEXTS[langIndex].text}
</div>
<button className="translate-btn" onClick={onTranslate}>
CYCLE DECRYPT ⟳
</button>
</div>
);

const HoloFlagDisplay = ({ bearer, account }) => {
const isOwner = account && bearer && account.toLowerCase() === bearer.toLowerCase();
return (
<div className={`holo-section ${isOwner ? 'owned' : ''}`} aria-label="Target Status">
<div className="holo-ring" style={{
animation: 'none',
padding: '0',
overflow: 'hidden',
borderRadius: '12px',
width: '100%',
height: '180px',
boxShadow: '0 0 30px rgba(0, 243, 255, 0.5), inset 0 0 20px rgba(0, 243, 255, 0.2)',
border: '2px solid #00f3ff'
}}>
<img
src="flag-holder.png"
alt="Asset Visual"
style={{
width: '100%',
height: '100%',
objectFit: 'cover',
borderRadius: '12px'
}}
/>
</div>
</div>
);
};

const InfoModal = ({ onClose }) => (
<div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
<div className="modal-box">
<button className="modal-close" onClick={onClose} aria-label="Close Modal">X</button>
<h2 id="modal-title" style={{color: '#FFD700', fontSize: '1.4rem', marginBottom: '20px', textShadow: '2px 2px #000'}}>★ MISSION OBJECTIVE ★</h2>
<p style={{color: '#fff', fontSize: '0.9rem', lineHeight: '1.8', marginBottom: '20px'}}>RULESET:<br/><span style={{color: '#00f3ff'}}>BE THE ACTIVE HOLDER DURING THE 00:00 UTC SNAPSHOT</span></p>
<div className="mystery-box"><div className="mystery-text">?</div></div>

<p style={{color: '#FFD700', fontSize: '1rem', lineHeight: '1.6', fontWeight: 'bold', marginTop: '20px'}}>REWARD: "SPEED DEMON" ARTIFACT</p>
<p style={{color: '#888', fontSize: '0.7rem', marginTop: '15px', lineHeight: '1.4'}}>This exclusive digital collectible serves as<br/><strong>Proof of Velocity</strong> within the Tempo network.<br/>One artifact per cycle. The fastest prevails.</p>
</div>
</div>
);

const FloatingTxField = () => {
const [floatingTxs, setFloatingTxs] = useState([]);
const processedHashes = useRef(new Set());
useEffect(() => {
const fetchLiveTxs = async () => {
try {
const provider = new JsonRpcProvider(RPC_URL);
const block = await provider.getBlock('latest');
if (block && block.transactions) {
const newTxs = [];
const recentTxs = block.transactions.slice(0, 4);
recentTxs.forEach(txHash => { if (!processedHashes.current.has(txHash)) { processedHashes.current.add(txHash); newTxs.push({ hash: txHash, id: Math.random(), top: Math.random() * 80 + 10, speed: Math.random() * 10 + 20 }); } });
if (processedHashes.current.size > 50) processedHashes.current.clear();
if (newTxs.length > 0) setFloatingTxs(prev => [...prev, ...newTxs].slice(-15));
}
} catch (e) { }
};
const interval = setInterval(fetchLiveTxs, 4000); fetchLiveTxs();
return () => clearInterval(interval);
}, []);
const openExplorer = (hash) => { if (!hash.includes("LINK")) window.open(EXPLORER_URL + hash, '_blank'); };
return ( <div className="tx-layer" aria-hidden="true"> {floatingTxs.map(tx => ( <div key={tx.id} className="tx-star" onClick={() => openExplorer(tx.hash)} style={{ top: `${tx.top}%`, animation: `floatRight ${tx.speed}s linear forwards` }}> {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 4)} </div> ))} </div> );
};

const TempoFactsFooter = () => {
const [fact, setFact] = useState("");
useEffect(() => {
setFact(TEMPO_FACTS[Math.floor(Math.random() * TEMPO_FACTS.length)]);
}, []);
return (
<div className="footer-facts">
[ PROTOCOL INTEL ]<br/>{fact}
</div>
);
};

function App() {
const [account, setAccount] = useState(null);
const [bearer, setBearer] = useState("LOCATING...");
const [currentMessage, setCurrentMessage] = useState("DATA UNAVAILABLE");
const [taunt, setTaunt] = useState(VICTORY_MESSAGES[0]);
const [status, setStatus] = useState("READY");
const [isLoading, setIsLoading] = useState(false);
const [showSuccess, setShowSuccess] = useState(false);
const [showInfo, setShowInfo] = useState(false);
const [isMintSuccess, setIsMintSuccess] = useState(false);
const [lastTxHash, setLastTxHash] = useState("");
const [hasMintedThisSession, setHasMintedThisSession] = useState(false);
const [langIndex, setLangIndex] = useState(0);

const [timeToSnapshot, setTimeToSnapshot] = useState("");
const [isSnapshotTime, setIsSnapshotTime] = useState(false);
const audioContext = useRef(null);

const isOwner = account && bearer && account.toLowerCase() === bearer.toLowerCase();

useEffect(() => {
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);
refreshData();
if (window.AudioContext || window.webkitAudioContext) {
audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
}
setTaunt(VICTORY_MESSAGES[Math.floor(Math.random() * VICTORY_MESSAGES.length)]);
}, []);

useEffect(() => {
const checkStatus = () => {
const now = new Date();
const h = now.getUTCHours();
const m = now.getUTCMinutes();
const s = now.getUTCSeconds();

if (h === 0 && m < 30) {
setIsSnapshotTime(true);
setTimeToSnapshot("SNAPSHOT ACTIVE");
} else {
setIsSnapshotTime(false);
const hoursLeft = 23 - h;
const minutesLeft = 59 - m;
const secondsLeft = 59 - s;
setTimeToSnapshot(`${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`);
}
};

const timer = setInterval(checkStatus, 1000);
checkStatus();
return () => clearInterval(timer);
}, []);

const refreshData = async () => {
try {
const provider = new JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
const current = await contract.currentBearer();
setBearer(current);
try { const msg = await contract.currentTaunt(); setCurrentMessage(msg); } catch (e) { setCurrentMessage("SECURE"); }
} catch (err) { setBearer("OFFLINE"); }
};

const handleSteal = async () => {
playSound('click');
if (!account) return connectWallet();
setIsLoading(true); setStatus("VERIFYING ASSETS...");
try {
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const balance = await provider.getBalance(account);
if (balance === 0n) { setStatus("INSUFFICIENT FUNDS"); setIsLoading(false); return; }
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
const tx = await contract.stealFlag(taunt, { gasLimit: 3000000 });
setStatus("UPLINKING DATA...");
await tx.wait();
playSound('success'); setStatus("TARGET SECURED!");
setIsMintSuccess(false);
setShowSuccess(true);
setHasMintedThisSession(false);
refreshData();
} catch (err) {
setStatus("CONNECTION FAILED");
}
setIsLoading(false);
};

const handleClaimNFT = async () => {
if (!isOwner || hasMintedThisSession) return;
setStatus("RETRIEVING ARTIFACT...");
setIsLoading(true);
try {
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);
const tx = await nftContract.mint(account);
setLastTxHash(tx.hash);
await tx.wait();
setHasMintedThisSession(true);
setIsMintSuccess(true);
setShowSuccess(true);
setStatus("ARTIFACT SECURED!");
} catch (err) {
setStatus("TRANSFER FAILED");
}
setIsLoading(false);
};

const connectWallet = async () => {
playSound('click');
if (window.ethereum) {
try {
await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: TEMPO_CHAIN_ID }] });
const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
setAccount(accounts[0]); setStatus("AUTHENTICATED");
} catch (err) { setStatus("ACCESS DENIED"); }
} else { alert("WEB3 PROVIDER NOT FOUND"); }
};

const playSound = (type) => {
if (!audioContext.current) return;
const ctx = audioContext.current; const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination);
if (type === 'success') { osc.type = 'square'; osc.frequency.setValueAtTime(440, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5); }
else { osc.type = 'triangle'; osc.frequency.setValueAtTime(200, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1); }
osc.start(); osc.stop(ctx.currentTime + 0.5);
};

const RadioPlayer = () => {
const [isPlaying, setIsPlaying] = useState(false);
const [trackIndex, setTrackIndex] = useState(0);
const [volume, setVolume] = useState(0.3);
const audioRef = useRef(null);
useEffect(() => { if(audioRef.current) audioRef.current.volume = volume; }, [volume]);
const togglePlay = () => { if (isPlaying) audioRef.current.pause(); else audioRef.current.play().catch(e => {}); setIsPlaying(!isPlaying); };
const changeTrack = (direction) => { setTrackIndex((prev) => (prev + direction + PLAYLIST.length) % PLAYLIST.length); if (isPlaying) setTimeout(() => audioRef.current.play(), 100); };
return (
<div className="radio-station" aria-label="Media Player">
<audio ref={audioRef} src={PLAYLIST[trackIndex].url} loop={false} onEnded={() => changeTrack(1)} />
<div className="station-screen">
<div className="visualizer-container">
{[...Array(10)].map((_, i) => <div key={i} className="viz-bar"></div>)}
</div>
<div style={{position: 'relative', zIndex: 2}}>
<span className="genre-tag">FREQ: {PLAYLIST[trackIndex].genre}</span>
<div style={{color: '#fff'}}>{PLAYLIST[trackIndex].title}</div>
<div style={{color: '#888', fontSize: '6px', marginTop: '2px'}}>{PLAYLIST[trackIndex].artist}</div>
</div>
</div>
<div className="controls-row">
<button className="radio-btn" onClick={() => changeTrack(-1)}>PREV</button>
<button className="radio-btn" onClick={togglePlay}>{isPlaying ? "STOP" : "PLAY"}</button>
<button className="radio-btn" onClick={() => changeTrack(1)}>NEXT</button>
</div>
<input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="volume-slider" aria-label="Volume" />
</div>
);
};

return (
<div style={styles.container}>
<style>{GLOBAL_CSS}</style>
<div className="scanlines"></div>
<div className="space-background"></div>
<FloatingTxField />
<div className="retro-grid"></div>
<RadioPlayer />
{showSuccess && <SuccessOverlay onClose={() => { setShowSuccess(false); setIsMintSuccess(false); }} isMintAction={isMintSuccess} txHash={lastTxHash} />}
{showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

<header style={styles.header}>
<h1 style={styles.mainTitle}>TEMPO RUSH</h1>
<div style={styles.subTitle}>THE ULTIMATE VELOCITY RACE ON TEMPO TESTNET</div>
<button onClick={() => setShowInfo(true)} className="gold-btn" style={{marginTop: '10px', fontSize: '0.6rem'}}>MISSION BRIEFING ★</button>
</header>

<MissionBriefing langIndex={langIndex} onTranslate={() => setLangIndex((prev) => (prev + 1) % MISSION_TEXTS.length)} />

<main className="pro-console" aria-label="Tactical Console">
<header className="console-header"><span>COMMAND CENTER</span><span>● SECURE</span></header>
<NetworkHUD />

<div className="pilot-info">
{!account ? <button onClick={connectWallet} style={styles.connectBtn}>[ INITIALIZE UPLINK ]</button> : `OPERATOR: ${account.substring(0,6)}...${account.substring(38)}`}
</div>

<section className="info-grid">
<HoloFlagDisplay bearer={bearer} account={account} />
<div className="data-section">
<div className="data-block">
<span className="data-label">CURRENT ASSET BEARER</span>
<div className="data-value" style={{color:'#00f3ff'}}>{bearer}</div>
</div>
<div className="data-block">
<span className="data-label">LATEST DECREE</span>
<div className="message-text">"{currentMessage}"</div>
</div>
</div>
</section>

<section className="action-area">
<label className="data-label" style={{marginBottom: '10px'}}>&gt; VICTORY DECREE SELECTION:</label>
<div className="message-display-box">
<div className="taunt-readout">{taunt}</div>
<button className="reroll-btn" onClick={() => setTaunt(VICTORY_MESSAGES[Math.floor(Math.random() * VICTORY_MESSAGES.length)])}>RANDOMIZE 🎲</button>
</div>
{isSnapshotTime && isOwner && !hasMintedThisSession ? (
<button
className="action-btn main"
onClick={handleClaimNFT}
style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500)', color: '#000', width: '100%', height: '60px', border: '2px solid #fff' }}
>
{isLoading ? "UPLOADING..." : "🏆 SECURE VICTORY ARTIFACT"}
</button>
) : (
<>
<div style={{textAlign: 'right', fontSize: '0.6rem', color: '#888', marginBottom: '5px'}}>
TIME UNTIL SNAPSHOT: <span style={{color: '#fff'}}>{timeToSnapshot}</span>
</div>
<TacticalActionArea account={account} isLoading={isLoading} handleSteal={handleSteal} />
</>
)}

{isOwner && (
<div className="broadcast-section">
<button className="twitter-btn" onClick={() => window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent("I am the current Speed King on Tempo Rush! Come and challenge me on Tempo Testnet! @temporush @tempo"), "_blank")}>
SHARE DOMINANCE ON X
</button>
</div>
)}
<div className="helper-text">COST: GAS FEE ONLY • REWARD: SUPREMACY & ARTIFACT DROP</div>
</section>

<BattleFeed />

<footer className="system-log-footer" role="status" aria-live="polite">
&gt; SYSTEM_LOG: <span style={{marginLeft: '10px', color: status.includes("FAILED") ? 'red' : '#39ff14'}}>{status}</span>
</footer>
</main>

<TempoFactsFooter />
<div style={{height: '100px', width: '100%'}}></div>
</div>
);
}

const styles = {
container: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'scroll', overflowX: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '30px', fontFamily: '"Press Start 2P", cursive', color: '#00f3ff', zIndex: 100 },
overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' },
header: { textAlign: 'center', zIndex: 100, marginBottom: '20px' },
mainTitle: { fontSize: '2.5rem', margin: 0, color: '#fff', textShadow: '3px 3px 0px #ff00ff' },
subTitle: { fontSize: '0.6rem', color: '#00f3ff', marginTop: '10px', letterSpacing: '4px' },
connectBtn: { background: 'transparent', border: 'none', color: '#ff00ff', cursor: 'pointer', fontFamily: '"Press Start 2P"', fontSize: '0.6rem', textDecoration: 'underline' },
actionButton: { width: '100%', padding: '20px', backgroundColor: '#00f3ff', color: '#000', border: 'none', fontSize: '0.9rem', cursor: 'pointer', fontFamily: '"Press Start 2P"', fontWeight: 'bold', textTransform: 'uppercase' }
};

export default App;
