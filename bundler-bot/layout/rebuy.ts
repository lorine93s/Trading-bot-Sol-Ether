import { connection } from "../config"
import base58 from "bs58"
import readline from "readline"
import {
    ComputeBudgetProgram,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction
} from "@solana/web3.js"
import {
    LiquidityPoolKeysV4,
    SPL_ACCOUNT_LAYOUT,
    TokenAccount
} from "@raydium-io/raydium-sdk";
import {
    NATIVE_MINT,
    TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountIdempotentInstruction,
    createCloseAccountInstruction,
    createTransferCheckedInstruction,
    getAssociatedTokenAddress,
    getAssociatedTokenAddressSync
} from "@solana/spl-token";
import { LP_wallet_keypair } from "../settings";
import { getBuyTx, getSellTx } from "../src/swapOnlyAmm";
import { mainMenuWaiting, readHolderWalletDataJson, readJson, sleep } from "../src/utils";
import { execute } from "../src/legacy";
import { PoolKeys } from "../src/getPoolKeys";
import { rl } from "../menu/menu";
import { derivePoolKeys } from "../src/poolAll";

// let rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// })

const mainKp = LP_wallet_keypair
const mainPk = mainKp.publicKey
const data = readJson()

export const manualRebuy = async () => {
    try {
        if(!data.mint) {
            throw new Error("mint is not set yet.")
        }

        rl.question("\t[Percent] - Buy Amount : ", async (answer: string) => {
            let buyPercentAmount = parseFloat(answer);
            let tokenBalance = buyPercentAmount * 10 ** 9 / 100
            // let poolKeys = await derivePoolKeys(poolId)
            
            // if(!poolKeys) {
            //     throw new Error("Fail to get poolKeys")
            // }
            const buyTx = await getBuyTx(connection, mainKp, baseMint, NATIVE_MINT, tokenBalance, poolId.toBase58())
            await sleep(2000)
            if (buyTx == null) {
                console.log("Fail to get the buy transaction in manual buying of the tokens")
                return
            }
            const latestBlockhashForBuy = await connection.getLatestBlockhash()
            const txBuySig = await execute(buyTx, latestBlockhashForBuy, true)
            const tokenBuyTx = txBuySig ? `https://solscan.io/tx/${txBuySig}` : ''
            console.log(tokenBuyTx)
            const tokenBalanceAfterBuy = await connection.getTokenAccountBalance(buyerAta)
            console.log("Remaining Total holding token balance: ", tokenBalanceAfterBuy.value.uiAmount)
            mainMenuWaiting()
        })
    }
    catch (error) {
        console.log(error);
    }
}