const {network} = require("hardhat");

const {networkConfig, DECIMAL, PRICE, NETWORK_NAME} = require("../helper-hardhat-config");
const constants = require("node:constants");

module.exports = async ({deployments, getNamedAccounts, ethers}) => {
    const {deploy, log} = await deployments;
    const {deployer} = await getNamedAccounts();


    const chainId = network.config.chainId;
    log(chainId);
    const chainIdConfig = networkConfig[chainId];
    console.log(chainIdConfig.name)
    log(NETWORK_NAME)

    log((NETWORK_NAME instanceof Array));
    if (NETWORK_NAME.includes(chainIdConfig.name)) {
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            /*这里的8,代表单位，代表扩大了多少倍，后面表示price*/
            args: [DECIMAL, PRICE],
            log: true
        });

        const mockV3 = await deployments.get("MockV3Aggregator");
        log(mockV3.address);
        log("Mock deployed...");
    }
}

module.exports.tags = ["all", "mocks"];