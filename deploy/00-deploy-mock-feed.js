const {network} = require("hardhat");

const {networkConfig, DECIMAL, PRICE, NETWORK_NAME} = require("../helper-hardhat-config");

module.exports = async ({deployments, getNamedAccounts}) => {
    const {deploy, log} = await deployments;
    const {deployer} = await getNamedAccounts();


    const chainId = network.config.chainId;

    const chainIdConfig = networkConfig[chainId];

    log(deployer);


    log((NETWORK_NAME.includes(chainIdConfig.name)));


    if (NETWORK_NAME.includes(chainIdConfig.name)) {
        log(chainId);
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