const {ethers} = require("hardhat");
const {networkConfig, NETWORK_NAME} = require("../helper-hardhat-config");
const {verify} = require("../utils/Vertify");
require("dotenv").config();
module.exports = async ({deployments, getNamedAccounts}) => {

    console.log(ethers.parseUnits("10"));
}

module.exports.tags = ["all", "test"];