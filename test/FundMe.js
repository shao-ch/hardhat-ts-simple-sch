const {deployments, getNamedAccounts,ethers} = require("hardhat");

describe("FundMe", async function () {
    /*首先我先要部署智能合约*/
    let fundMe;
    beforeEach(async function () {

        const {deployer} = await getNamedAccounts();
        const deploymentResult= await deployments.deploy("FundMe", {
            contract: "FundMe",
            from: deployer,
            log: true,
            args: [
                deployer
            ]
        })
        fundMe=await deploymentResult.deployed();
    });

    it('fund test', async () => {
       const tx=await fundMe.fund();
        const resp= tx.wait(1);
        console.log(resp)
    });
});