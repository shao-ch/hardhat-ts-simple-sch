require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("hardhat-gas-reporter")
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */

// const {ProxyAgent, setGlobalDispatcher} = require("undici");
// const proxyAgent = new ProxyAgent("http://127.0.0.1:1802");
// setGlobalDispatcher(proxyAgent);

module.exports = {
    solidity: "0.8.24",
    networks: {
        hardhat: {},
        sepolia: {
            /*这里是要给你要部署到哪里的地址，我这里选择的是ankr*/
            url: process.env.PRIVATE_URL,
            accounts: [process.env.PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6
        },
        localhost: {
            url: "HTTP://127.0.0.1:8545",
            accounts: [process.env.PRIVATE_KEY_LOCAL],
            chainId: 31337,
        },
        ganache: {
            url: "HTTP://127.0.0.1:7545",
            accounts: [process.env.PRIVATE_KEY_GANACHE],
            chainId: 1337,
        },
    },

    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        // token: "ETH",
    },

    /*这个是verify用的，进行远程代码认证*/
    etherscan: {
        apiKey: process.env.ETHERS_API_HARDHAT_KEY,
    },
    // sourcify: {
    //     // Disabled by default
    //     // Doesn't need an API key
    //     enabled: true
    // },

    namedAccounts: {
        deployer: {
            default: 0,
            "localhost":0,
        },
        user: {
            default: 1,
            "localhost":"0",
        }

    }

    // paths: {
    //     deployments: "custom_deploy", // 更改部署脚本的路径，当你执行 "npx hardhat deploy" 时，Hardhat 将从该目录中加载部署脚本。
    // },
};
