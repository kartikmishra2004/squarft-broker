import sql from "../../config/db.js";
import { notifyWithdrawalRequested } from "../../utils/brokerNotifications.js";

// getWalletOverview
export const getWalletOverview = async (req, res) => {
    try {
        const brokerId = req.user.id;

        // Fetch wallet balance
        const walletResult = await sql`
            SELECT main_balance 
            FROM broker_wallets 
            WHERE broker_id = ${brokerId}
        `;
        const mainBalance = walletResult.length > 0 ? walletResult[0].main_balance : 0;

        // Fetch recent transactions
        const transactionsResult = await sql`
            SELECT * 
            FROM wallet_transactions 
            WHERE broker_id = ${brokerId}
            ORDER BY created_at DESC
            LIMIT 5
        `;

        const recentTransactions = transactionsResult.map(tx => ({
            id: tx.id,
            amount: Number(tx.amount),
            type: tx.type,
            status: tx.status,
            propertyName: tx.property_name,
            propertyAddress: tx.property_address,
            transferToDetails: tx.transfer_to_details,
            createdAt: tx.created_at
        }));

        res.status(200).json({
            success: true,
            data: {
                mainBalance: Number(mainBalance),
                recentTransactions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// getTransactionHistory
export const getTransactionHistory = async (req, res) => {
    try {
        const brokerId = req.user.id;
        const { page = 1, limit = 10, propertyName } = req.query;
        const offset = (page - 1) * limit;

        let transactionsResult;
        let countResult;

        if (propertyName) {
            transactionsResult = await sql`
                SELECT * 
                FROM wallet_transactions 
                WHERE broker_id = ${brokerId} 
                AND property_name ILIKE ${'%' + propertyName + '%'}
                ORDER BY created_at DESC
                LIMIT ${limit} OFFSET ${offset}
            `;
            countResult = await sql`
                SELECT COUNT(*) 
                FROM wallet_transactions 
                WHERE broker_id = ${brokerId} 
                AND property_name ILIKE ${'%' + propertyName + '%'}
            `;
        } else {
            transactionsResult = await sql`
                SELECT * 
                FROM wallet_transactions 
                WHERE broker_id = ${brokerId}
                ORDER BY created_at DESC
                LIMIT ${limit} OFFSET ${offset}
            `;
            countResult = await sql`
                SELECT COUNT(*) 
                FROM wallet_transactions 
                WHERE broker_id = ${brokerId}
            `;
        }

        const count = Number(countResult[0].count);

        const transactions = transactionsResult.map(tx => ({
            id: tx.id,
            amount: Number(tx.amount),
            type: tx.type,
            status: tx.status,
            propertyName: tx.property_name,
            propertyAddress: tx.property_address,
            transferToDetails: tx.transfer_to_details,
            createdAt: tx.created_at
        }));

        res.status(200).json({
            success: true,
            data: {
                count,
                page: Number(page),
                transactions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// getTransactionDetails
export const getTransactionDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await sql`
            SELECT * 
            FROM wallet_transactions 
            WHERE id = ${id}
        `;

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        const data = result[0];

        res.status(200).json({
            success: true,
            data: {
                transactionNo: data.id,
                amount: Number(data.amount),
                type: data.type,
                status: data.status,
                propertyName: data.property_name,
                propertyAddress: data.property_address,
                transferToDetails: data.transfer_to_details,
                createdAt: data.created_at
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// getBankAccounts
export const getBankAccounts = async (req, res) => {
    try {
        const brokerId = req.user.id;

        const result = await sql`
            SELECT * 
            FROM broker_bank_accounts 
            WHERE broker_id = ${brokerId}
        `;

        const bankAccounts = result.map(account => ({
            id: account.id,
            bankName: account.bank_name,
            accountNumberMasked: account.account_number_masked,
            ifscCode: account.ifsc_code,
            isDefault: account.is_default
        }));

        res.status(200).json({
            success: true,
            data: bankAccounts
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// addBankAccount
export const addBankAccount = async (req, res) => {
    try {
        const brokerId = req.user.id;
        const { bankName, accountNumber, ifscCode, isDefault = false } = req.body;

        const accountNumberMasked = 'XXXXXXXX' + accountNumber.slice(-4);

        if (isDefault) {
            await sql`
                UPDATE broker_bank_accounts 
                SET is_default = false 
                WHERE broker_id = ${brokerId}
            `;
        }

        const result = await sql`
            INSERT INTO broker_bank_accounts 
            (broker_id, bank_name, account_number_masked, account_number_encrypted, ifsc_code, is_default)
            VALUES 
            (${brokerId}, ${bankName}, ${accountNumberMasked}, ${accountNumber}, ${ifscCode}, ${isDefault})
            RETURNING *
        `;

        const data = result[0];

        res.status(201).json({
            message: "Account detail added successfully",
            bankAccount: {
                id: data.id,
                bankName: data.bank_name,
                accountNumberMasked: data.account_number_masked,
                ifscCode: data.ifsc_code,
                isDefault: data.is_default
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// requestWithdrawal
export const requestWithdrawal = async (req, res) => {
    try {
        const brokerId = req.user.id;
        const { requestedAmount, bankAccountId } = req.body;

        const walletResult = await sql`
            SELECT main_balance 
            FROM broker_wallets 
            WHERE broker_id = ${brokerId}
        `;

        if (walletResult.length === 0 || walletResult[0].main_balance < requestedAmount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient balance"
            });
        }

        const bankResult = await sql`
            SELECT * 
            FROM broker_bank_accounts 
            WHERE id = ${bankAccountId}
        `;

        if (bankResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Bank account not found"
            });
        }

        const bankData = bankResult[0];
        const transferToDetails = `${bankData.bank_name} - ${bankData.account_number_masked}`;
        const newBalance = Number(walletResult[0].main_balance) - Number(requestedAmount);

        // Transaction handling - withdraw amount and insert history
        await sql.begin(async (sql) => {
            await sql`
                UPDATE broker_wallets 
                SET main_balance = ${newBalance}, updated_at = NOW() 
                WHERE broker_id = ${brokerId}
            `;

            const txResult = await sql`
                INSERT INTO wallet_transactions 
                (broker_id, amount, type, status, transfer_to_details)
                VALUES 
                (${brokerId}, ${requestedAmount}, 'DEBIT', 'PENDING', ${transferToDetails})
                RETURNING id
            `;

            // await sendNotification({
            //     userId: brokerId,
            //     title: "Withdrawal Request Submitted",
            //     body: `Your withdrawal request of ₹${requestedAmount} has been submitted.`,
            //     type: "wallet",
            //     metadata: {
            //         transaction_id: txResult[0].id,
            //         amount: requestedAmount,
            //     },
            // });
            await notifyWithdrawalRequested(brokerId, {
                withdrawalAmount: requestedAmount,
                withdrawalId: txResult[0].id,
                requestedAt: new Date().toISOString(),
                });

            res.status(200).json({
                success: true,
                data: {
                    transactionId: txResult[0].id,
                    newBalance: newBalance,
                    status: 'PENDING'
                }
            });
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const requestWithdrawalSafe = async (req, res) => {
    try {
        const brokerId = req.user.id;
        const { requestedAmount, bankAccountId } = req.body;
        const amount = Number(requestedAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "A valid withdrawal amount is required"
            });
        }

        if (!bankAccountId) {
            return res.status(400).json({
                success: false,
                message: "Bank account is required"
            });
        }

        const bankResult = await sql`
            SELECT *
            FROM broker_bank_accounts
            WHERE id = ${bankAccountId}
              AND broker_id = ${brokerId}
        `;

        if (bankResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Bank account not found"
            });
        }

        const bankData = bankResult[0];
        const transferToDetails = `${bankData.bank_name} - ${bankData.account_number_masked}`;

        const result = await sql.begin(async (sql) => {
            const walletResult = await sql`
                SELECT main_balance
                FROM broker_wallets
                WHERE broker_id = ${brokerId}
                FOR UPDATE
            `;

            if (walletResult.length === 0) {
                const error = new Error("Insufficient wallet balance");
                error.statusCode = 400;
                throw error;
            }

            const currentBalance = Number(walletResult[0].main_balance);

            if (!Number.isFinite(currentBalance) || currentBalance < amount) {
                const error = new Error("Insufficient wallet balance");
                error.statusCode = 400;
                throw error;
            }

            const newBalance = currentBalance - amount;

            await sql`
                UPDATE broker_wallets
                SET main_balance = ${newBalance}, updated_at = NOW()
                WHERE broker_id = ${brokerId}
            `;

            const txResult = await sql`
                INSERT INTO wallet_transactions
                (broker_id, amount, type, status, transfer_to_details)
                VALUES
                (${brokerId}, ${amount}, 'DEBIT', 'PENDING', ${transferToDetails})
                RETURNING id
            `;

            return {
                transactionId: txResult[0].id,
                newBalance,
            };
        });

        notifyWithdrawalRequested(brokerId, {
            withdrawalAmount: amount,
            withdrawalId: result.transactionId,
            requestedAt: new Date().toISOString(),
        }).catch((notificationError) => {
            console.error("Withdrawal notification failed:", notificationError);
        });

        return res.status(200).json({
            success: true,
            data: {
                transactionId: result.transactionId,
                newBalance: result.newBalance,
                status: 'PENDING'
            }
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const commissionHistory = async (req, res) => {
    try {
        const brokerId = req.user.id;
        const { page = 1, limit = 10, propertyName } = req.query;
        const offset = (page - 1) * limit;


        const transactionsResult = await sql`
                SELECT * 
                FROM wallet_transactions 
                WHERE broker_id = ${brokerId} AND status = 'CREDIT'
                ORDER BY created_at DESC
                LIMIT ${limit} OFFSET ${offset}
            `;
        const countResult = await sql`
                SELECT COUNT(*) 
                FROM wallet_transactions 
                WHERE broker_id = ${brokerId} AND status = 'CREDIT'
            `;


        const count = Number(countResult[0].count);

        const transactions = transactionsResult.map(tx => ({
            id: tx.id,
            amount: Number(tx.amount),
            type: tx.type,
            status: tx.status,
            propertyName: tx.property_name,
            propertyAddress: tx.property_address,
            transferToDetails: tx.transfer_to_details,
            createdAt: tx.created_at
        }));

        res.status(200).json({
            success: true,
            data: {
                count,
                page: Number(page),
                transactions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
