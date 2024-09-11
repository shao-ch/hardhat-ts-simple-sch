
// describe("FundMe", async function () {
//     /*首先我先要部署智能合约*/
//     let fundMe;
//     let aggregatorV3;
//     let deployer;
//     beforeEach(async function () {
//         deployer = (await getNamedAccounts()).deployer;
//         // await deployments.fixture(["all"]);
//         /*这里获取部署的合约，但是要告诉他需要哪个account上的合约*/
//         fundMe = await ethers.getContractAt("FundMe", deployer);
//         aggregatorV3 = await ethers.getContractAt("MockV3Aggregator",deployer);
//         console.log("--------------------------------")
//     });
//
//     describe("constructor",async function(){
//         it ("test data",async function(){
//             const resp =await fundMe.funders;
//             console.log(resp)
//         });
//     });
// });
const {deployments, getNamedAccounts, ethers} = require("hardhat");
const {assert} = require("chai");


describe("FundMe", async function () {
    it('should pass',async function () {
        const {deployer} = await getNamedAccounts();
        console.log(`deployer address is [${deployer}]`);

        const contract = await ethers.getContractAt("FundMe", deployer);
        console.log(contract.target);
        const aaa = await contract.fund();
        await aaa.wait(1);
        const value = await contract.getFunders();
        // const value = await contract.funders();
        console.log(value);
        // console.log(contract.fragments);
    });
});