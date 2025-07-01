"use client"

import InputForm from "@/components/Ui/InputField"
import { useEffect, useMemo, useState } from "react";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants"
import { useAccount, useChainId, useConfig, useWriteContract, } from 'wagmi'
import { readContract, waitForTransactionReceipt } from "@wagmi/core"
import { calculateTotal } from "@/utils/calculateTotal/calculateTotal"
import { Spinner } from "./Ui/Spinner"; // We'll create this component


export default function AirdropForm() {
    const [tokenAddress, setTokenAddress] = useState("")
    const [recipients, setRecipients] = useState("")
    const [amounts, setAmounts] = useState("")
    const [isLoading, setIsLoading] = useState(false);
    const [tokenDetails, setTokenDetails] = useState({ name: '', symbol: '', decimals: 0 });
    const chainId = useChainId()
    const config = useConfig()
    const account = useAccount()
    const total: number = useMemo(() => calculateTotal(amounts), [amounts])
    const { data: hash, writeContract } = useWriteContract()

    useEffect(() => {
        // Load saved data from localStorage
        const savedData = localStorage.getItem('airdropFormData');
        if (savedData) {
            const { tokenAddress: savedToken, recipients: savedRecipients, amounts: savedAmounts } = JSON.parse(savedData);
            setTokenAddress(savedToken || '');
            setRecipients(savedRecipients || '');
            setAmounts(savedAmounts || '');
        }
    }, []);

    // Add this effect to save changes
    useEffect(() => {
        localStorage.setItem('airdropFormData', JSON.stringify({
            tokenAddress,
            recipients,
            amounts
        }));
    }, [tokenAddress, recipients, amounts]);

    // Add this function to fetch token details
    async function fetchTokenDetails() {
        if (!tokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) return;

        try {
            const [nameRaw, symbolRaw, decimalsRaw] = await Promise.all([
                readContract(config, {
                    abi: erc20Abi,
                    address: tokenAddress as `0x${string}`,
                    functionName: "name",
                }),
                readContract(config, {
                    abi: erc20Abi,
                    address: tokenAddress as `0x${string}`,
                    functionName: "symbol",
                }),
                readContract(config, {
                    abi: erc20Abi,
                    address: tokenAddress as `0x${string}`,
                    functionName: "decimals",
                })
            ]);

            const name = nameRaw as string;
            const symbol = symbolRaw as string;
            const decimals = typeof decimalsRaw === "bigint" ? Number(decimalsRaw) : (decimalsRaw as number);

            setTokenDetails({ name, symbol, decimals });
        } catch (error) {
            console.error('Error fetching token details:', error);
        }
    }

    async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {
        if (!tSenderAddress) {
            alert("tSender address is not available for this chain.");
            return 0;
        }
        const response = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [account.address, tSenderAddress as `0x${string}`],
        })
        // token.allowance(account, tsender)
        return response as number
    }

    async function handleSubmit() {
        setIsLoading(true);
        try {
            const tSenderAddress = chainsToTSender[chainId]["tsender"]
            const approvedAmount = await getApprovedAmount(tSenderAddress)

            if (approvedAmount < total) {
                // Validate the address format
                if (!tokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
                    throw new Error('Invalid token address format')
                }

                const approvalHash = await readContract(config, {
                    abi: erc20Abi,
                    address: tokenAddress as `0x${string}`,
                    functionName: "approve",
                    args: [account.address, tSenderAddress as `0x${string}`, BigInt(total)],
                })
                // Explicitly cast approvalHash to `0x${string}`
                const approvalReceipt = await waitForTransactionReceipt(config, {
                    hash: approvalHash as `0x${string}`,
                })
                console.log("Approval confirmed:", approvalReceipt)
            } else {

                writeContract({
                    abi: tsenderAbi,
                    address: tSenderAddress as `0x${string}`,
                    functionName: "airdropERC20",
                    args: [
                        tokenAddress,
                        recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                        amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                        BigInt(total),
                    ],
                })
            }
        } catch (error) {
            console.error(error);
            alert('Transaction failed!');
        } finally {
            setIsLoading(false);
        }
    }

    // Add this effect to fetch token details when address changes
    useEffect(() => {
        fetchTokenDetails();
    }, [tokenAddress]);

    return (
        <div className="space-y-4">
            <InputForm
                label="Token Address"
                placeholder="0x..."
                value={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)}
            />
            <InputForm
                label="Recipients"
                placeholder="0x1234...;0x5678..."
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                large={true}  // Assuming you want a large input for multiple addresses
            />
            <InputForm
                label="Amounts"
                placeholder="100;200;300"
                value={amounts}
                onChange={e => setAmounts(e.target.value)}
                large={true}  // Assuming you want a large input for multiple addresses
            />
            <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="
                    px-6 py-3
                    bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                    text-white font-medium rounded-lg
                    transition-all duration-200
                    shadow-md hover:shadow-lg
                    focus:outline-none focus:ring-4 focus:ring-blue-300/50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2
                "
            >
                {isLoading && <Spinner />}
                Send Tokens
            </button>

            {/* Token Details Box */}
            {tokenAddress && tokenDetails.name && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <h3 className="font-semibold mb-2">Token Details</h3>
                    <p>Name: {tokenDetails.name}</p>
                    <p>Symbol: {tokenDetails.symbol}</p>
                    <p>Decimals: {tokenDetails.decimals}</p>
                </div>
            )}
        </div>
    )
}