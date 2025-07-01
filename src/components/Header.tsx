import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaGithub } from "react-icons/fa";

export default function Header() {
    return (
        <header className="flex items-center justify-between p-4 bg-white shadow-md">
            {/* Left section - Title */}
            <div className="flex items-center gap-4">



                {/* Right section - GitHub + Connect */}
                <a
                    href="https://github.com/mikelitooz/TSender"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-600 transition-colors"
                >
                    <FaGithub size={24} />
                </a>
                <h1 className="text-2xl font-bold">tsender</h1>
            </div>
            <ConnectButton />
        </header>
    );
}