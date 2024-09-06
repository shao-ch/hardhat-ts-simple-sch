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
