"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { anvil, zksync } from "wagmi/chains";

const config = getDefaultConfig({
    appName: "TSender",
    projectId: process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID!!,
    chains: [anvil, zksync],
    ssr: false
});

export default config;