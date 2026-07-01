import express from "express";
import {
    getWalletOverview,
    getTransactionHistory,
    getTransactionDetails,
    getBankAccounts,
    addBankAccount,
    requestWithdrawalSafe,
    commissionHistory
} from "../../controllers/broker/walletController.js";
import { validateToken } from "../../middleware/auth.js";

const router = express.Router();

router.use(validateToken);

router.get("/overview", getWalletOverview);
router.get("/transactions", getTransactionHistory);
router.get("/transactions/:id", getTransactionDetails);
router.get("/banks", getBankAccounts);
router.post("/banks", addBankAccount);
router.post("/withdraw", requestWithdrawalSafe);

router.get("/commissionHistory", commissionHistory)

export default router;
