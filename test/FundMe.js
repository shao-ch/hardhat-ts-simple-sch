const {deployments, getNamedAccounts, ethers, network} = require("hardhat");
const {assert, expect} = require("chai");
const {NETWORK_NAME} = require("../helper-hardhat-config");

(!NETWORK_NAME.includes(network.name)) ? describe.skip :
    describe("FundMe", async function () {
        /*首先我先要部署智能合约*/
        let fundMe;
        let aggregatorV3;
        let deployer;
        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer;
            const fundMeDeployment = await deployments.get("FundMe");
            const mockV3AggregatorDeployment = await deployments.get("MockV3Aggregator");
            await deployments.fixture(["all"]);
            /*这里获取部署的合约，但是要告诉他需要哪个account上的合约*/
            fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);
            // console.log(`fundMe address is [${fundMeDeployment.address}]`)
            // console.log(`aggregatorV3 address is [${mockV3AggregatorDeployment.address}]`)

            aggregatorV3 = await ethers.getContractAt("MockV3Aggregator", mockV3AggregatorDeployment.address);
            console.log("--------------------------------")
        });

        // describe("constructor", async function () {
        //     it("compare address", async function () {
        //         const conAgg = await fundMe.getAggregatorV3();
        //         console.log(`conAgg address is [${aggregatorV3.target}]`)
        //         assert(conAgg === aggregatorV3.target)
        //     })
        // });

        // describe("fund", async function () {
        //     it('should fund', async function () {
        //         const sendValue = ethers.parseEther("0.1");
        //
        //         const txResponse = await fundMe.fund({value: sendValue});
        //         await txResponse.wait(1);
        //         /*获取发送的数值*/
        //         const contractBalance = await fundMe.getFunderValue(deployer);
        //
        //         console.log(contractBalance / ethers.parseEther("1"))
        //     });
        // })

        describe("multiFund", async function () {
            it('should multiFund', async function () {
                const sendValue = ethers.parseEther("0.1");

                const accounts = await ethers.getSigners();

                const funderBefore = await fundMe.getFunders();

                console.log(funderBefore.length)
                for (let i = 0; i < 6; i++) {
                    await fundMe.connect(accounts[i]);
                    const txResponse = await fundMe.fund({value: sendValue});
                    await txResponse.wait(1);
                }

                /*获取发送的数值*/
                const funder = await fundMe.getFunders();

                console.log(funder.length)
            });
        })


        describe("withdraw", async function () {

            it("test withdraw", async function () {
                /*首先获取退款前的金额*/

                const beforeWithDrawFundMeBalance = await ethers.provider.getBalance(fundMe.target);

                const beforeWithDrawDeployerBalance = await ethers.provider.getBalance(deployer);

                const beforeTotal = BigInt(beforeWithDrawFundMeBalance) + BigInt(beforeWithDrawDeployerBalance);
                console.log("--------------------------------------")
                /*然后执行退款行为*/
                const txWithdraw = await fundMe.withdrawV2();
                const withdrawReceipt = await txWithdraw.wait(1);

                /*计算退款过后的值*/
                const afterWithDrawFundMeBalance = await ethers.provider.getBalance(fundMe.target);

                const afterWithDrawDeployerBalance = await ethers.provider.getBalance(deployer);
                /*获取此次交易的gasfeed*/
                const gasUsed = BigInt(withdrawReceipt.fee);

                const afterTotal = gasUsed + BigInt(afterWithDrawFundMeBalance) + BigInt(afterWithDrawDeployerBalance);

                console.log(`afterTotal is [${afterTotal.toString()}]`)

                const funder = await fundMe.getFunders();

                console.log(`after funders is [${funder.length}]`);

                console.log("--------------------------------------")
                console.assert(afterTotal.toString() === beforeTotal.toString())
            })
        })

        describe("multiFundV2", async function () {
            it('should multiFundV2', async function () {
                const sendValue = ethers.parseEther("0.1");

                const accounts = await ethers.getSigners();

                const funderBefore = await fundMe.getFunders();

                console.log(funderBefore.length)
                for (let i = 0; i < 6; i++) {
                    await fundMe.connect(accounts[i]);
                    const txResponse = await fundMe.fund({value: sendValue});
                    await txResponse.wait(1);
                }

                /*获取发送的数值*/
                const funder = await fundMe.getFunders();

                console.log(funder.length)
            });
        })

        // describe("withdrawV2", async function () {
        //     it("test withdrawV2", async function () {
        //         const account = await ethers.getSigners();
        //
        //         const txWithdraw = await fundMe.connect(account[2]);
        //
        //         await txWithdraw.withdraw();
        //         expect().to.be.revertedWith("FundMe_Not_Owner");
        //
        //     })
        // })

        describe("cheapWithdraw", async function () {

            it('cheapWithdraw run', async function () {

                const beforeBalance = await ethers.provider.getBalance(fundMe.target);
                const beforeDeployBalance = await ethers.provider.getBalance(deployer);

                const beforeTotal = BigInt(beforeBalance) + BigInt(beforeDeployBalance);
                const beforeFunder = await fundMe.getFunders();

                console.log(`cheapWithdraw beforeFunder is [${beforeFunder.length}]`)

                const txCheapWithdraw = await fundMe.cheapWithdraw();
                const receipt = await txCheapWithdraw.wait(1);


                /*计算退款过后的值*/
                const afterWithDrawFundMeBalance = await ethers.provider.getBalance(fundMe.target);

                const afterWithDrawDeployerBalance = await ethers.provider.getBalance(deployer);
                /*获取此次交易的gasfeed*/
                const gasUsed = BigInt(receipt.fee);

                const afterTotal = gasUsed + BigInt(afterWithDrawFundMeBalance) + BigInt(afterWithDrawDeployerBalance);

                console.log("--------------------------------------")

                const funder = await fundMe.getFunders();

                console.log(funder.length);
                console.assert(afterTotal.toString() === beforeTotal.toString())
            });
        })

        describe("cheapWithdrawV2", async function () {
            console.log(ethers.parseEther("1000000"))
})
    });


