require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.24",
    networks: {
        hardhat: {},
        // sepolia: {
        //     url: process.env.PRIVATE_URL,
        //     accounts: [process.env.PRIVATE_KEY],
        //     chainId: 11155111,
        // },
        localhost: {
            url: "HTTP://127.0.0.1:8545",
            accounts: [process.env.PRIVATE_KEY_LOCAL],
            chainId: 31337,
        }
    },

    /*这个是verify认证需要的api*/
    // etherscan: {
    //     apiKey: process.env.ETHERS_API_HARDHAT_KEY,
    // },

    /*这个是打印gas 花费的报告的*/
    // gasReporter: {
    //     enabled: true,
    //     currency: "USD",
    //     noColors: true,
    //     coinmarketcap: "30163af0-9406-4a93-85a2-627fde719a5a",
    //     L1Etherscan: process.env.ETHERS_API_HARDHAT_KEY,
    //     // outputFile:"./gas_reporter.txt",
    //     offline: true
    // },

    namedAccounts: {
        deployer: {
            default: 0,
            "localhost":"0",
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
