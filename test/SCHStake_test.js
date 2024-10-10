const {ethers, upgrades} = require("hardhat")
const {ErrorDecoder, DecodedError} = require("ethers-decode-error")
const {expect} = require("chai");

describe("SCHStake", async function () {

    /*优先设置本地代币*/
    let owner, user1, user2, schStake, schToken, schTokenAddress, pool1TokenAddress, pool2TokenAddress, errorDecoder;
    let initFlag = false;


    if (initFlag) {
        before(async () => {
            [owner, user1, user2] = await ethers.getSigners();

            const sCTokenFactory = await ethers.getContractFactory("SCToken");
            const schTokenIns = await upgrades.deployProxy(sCTokenFactory,
                ["SCToken", 100, "SCT"], {initializer: "initialize"})
            await schTokenIns.waitForDeployment();
            const tokenAddress = await schTokenIns.getAddress();
            schToken = tokenAddress;
            console.log("SCToken deployed to:", tokenAddress);

            const sCHStakeContractFactory = await ethers.getContractFactory("SCHStake");

            try {
                schStake = await upgrades.deployProxy(sCHStakeContractFactory,
                    [tokenAddress, 3], {initializer: "initialize", kind: "uups"});
            } catch (e) {
                if (e.data === undefined || e.data.result === undefined) {
                    console.log("deploy is:", e)
                } else {
                    console.log("deploy error is:", schToken.interface.parseError(e.data.result))
                }
            }

            await schStake.waitForDeployment();

            console.log("SCHStake deployed to:", await schStake.getAddress())
        })
    } else {
        before(async () => {

            [owner, user1, user2] = await ethers.getSigners();
            schTokenAddress = "0xdDEb1A4F4600614E4513A156392E69a3825904A9";
            schToken = await ethers.getContractAt("SCToken", schTokenAddress);
            schStake = await ethers.getContractAt("SCHStake", "0xeBF90A478cbBf174E9aeB255450bAbEc196335C4");
            errorDecoder = ErrorDecoder.create([schStake.interface])
        })
    }


    it('SCHStake test1 getSCTokenAddress', async () => {
        const result = await schStake.getSCTokenAddress();
        expect(result).to.equal(schToken);
    });

    it('SCHStake test2 getStakeLock', async () => {
        const result = await schStake.getStakeLock();
        console.log("SCHStake stakeLock is :", result)
    });

    it('SCHStake test3 balance', async () => {
        try {
            const result = await schStake.getBalance(owner);
            console.log("owner balance is  :", ethers.formatEther(result))
        } catch (e) {
            if (e.data === undefined || e.data.result === undefined) {
                console.log("test2 error is:", e)
            } else {
                console.log("test2 error is:", schStake.interface.parseError(e.data.result))
            }
        }

    });

    it('SCHStake test4 addPool1', async () => {
        try {
            const beforeLen = await schStake.getPoolLength();
            console.log("beforeLen is :", beforeLen)
            const tx = await schStake.addPool(20, schToken, 0, false, 1);
            tx.wait(1)
            console.log("afterLen is :", await schStake.getPoolLength())
        } catch (e) {
            console.log(e)
        }
    });

    it('SCHStake test5 addPool2', async () => {
        try {
            const beforeLen = await schStake.getPoolLength();
            console.log("beforeLen is :", beforeLen)
            const tx = await schStake.addPool(30, schToken, 0, true, 2);
            tx.wait(1)
            console.log("afterLen is :", await schStake.getPoolLength())
        } catch (e) {
            console.log(e)
        }
    });

    it('SCHStake test6 addPool3', async () => {
        try {
            const beforeLen = await schStake.getPoolLength();
            console.log("beforeLen is :", beforeLen)
            const tx = await schStake.addPool(50, schToken, 0, true, 3);
            tx.wait(1)
            console.log("afterLen is :", await schStake.getPoolLength())
        } catch (e) {
            console.log(e)
        }
    });

    it('SCHStake test7 getPoolLen', async () => {
        try {
            console.log("poolLen is :", await schStake.getPoolLength())
        } catch (e) {
            console.log(e)
        }
    });


    it('SCHStake test8 getPoolByPid', async () => {
        try {
            const beforeLen = await schStake.getPool(0);
            console.log("beforeLen is :", beforeLen)
        } catch (e) {
            if (e.data === undefined || e.data.result === undefined) {
                console.log("test5 is:", e)
            } else {
                console.log("test5 error is:", schStake.interface.parseError(e.data.result))
            }
        }
    });

    it('SCHStake test9 give user transfer 20eth', async () => {
        await schToken.transfer(user1, ethers.parseEther("20"));
    })


    it('SCHStake test10 user1 stake 1eth', async () => {
        try {
            //0
            /*首先查询一下user1制定的token的余额*/
            const user1Balance = await schStake.getContractBalance(0, user1);

            console.log("user1 balance is :", user1Balance)

            /*优先授权才能进行转账*/
            const schStakeAddress = await schStake.getAddress();
            /*充值授权,由于转账需要授权*/
            const stakeAmount = ethers.parseEther("1");
            await schToken.connect(user1).approve(schStakeAddress, stakeAmount)

            /*然后进行质押*/
            await schStake.connect(user2).stake(0, user2, stakeAmount);
            console.log("pid is 0’s pool info :", await schStake.getPool(0))
        } catch (e) {
            if (e.data === undefined || e.data.result === undefined) {
                console.log("test10 is:", e)
            } else {
                const a = await errorDecoder.decode(e)
                // const decodedError = schStake.interface.parseError(e.data);

                console.log("test10 error is:", a)
            }
        }
    });

    it('SCHStake test11 query user1 balance', async () => {
        try {
            const result = await schStake.connect(user1).getBalance(0, user1);
            console.log("user1 balance is :", result)
        } catch (e) {
            if (e.data === undefined || e.data.result === undefined) {
                console.log("test10 is:", e)
            } else {
                console.log("test10 error is:", schStake.interface.parseError(e.data.result))
            }
        }
    });


    it('SCHStake test12 update reward', async () => {

        try {
            const beforePid0 = await schStake.getPool(0);
            console.log("beforeLen is :", beforePid0)
            await schStake.updateReward();
            console.log("after is :", await schStake.getPool(0))
        } catch (e) {
            console.log("test12 is:", await errorDecoder.decode(e))
        }
    });

    it('SCHStake test13 user1 pause stake', async () => {

        try {
            const stakeAmount = ethers.parseEther("1");

            const beforePid0 = await schStake.getPool(0);
            console.log("beforeLen is :", beforePid0)
            const tx = await schStake.connect(user1).pauseStake(0, user1, stakeAmount);

            const receipt = await tx.wait(1);

            for (const event of receipt.events) {
                if (event.event === "RequestStake") {
                    console.log("RequestStake event is :", event)
                }
            }
            console.log("after is :", await schStake.getPool(0))
        } catch (e) {
            console.log("test12 is:", await errorDecoder.decode(e))
        }
    })


    it('SCHStake test14 user1 getReward', async () => {

        try {
            console.log("user1 before balance is :", await schToken.getBalance(user1));
            const tx=await schStake.getReward(0,user1);
            const receipt=await tx.wait(1)

            for (const event of receipt.events){
                if(event.event==="GetReward"){
                    console.log("GetReward event is :",event);
                }
            }
            console.log("user1 info is :", await schToken.connect(user1).getUserInfo(0,user1));

            console.log("user1 before balance is :", await schToken.getBalance(user1));

        } catch (e) {
            console.log("test12 is:", await errorDecoder.decode(e))
        }
    })

    it('SCHStake test15 pause contract', async () => {
        try {
            console.log("user1 balance is :", await schToken.getBalance(user1));

            const tx=await schStake.pause();
            await tx.wait(1)
            console.log("pause:user1 before balance is :", await schToken.getBalance(user1));

            const unpauseTX=await schStake.unPause();
            await unpauseTX.wait(1)

            console.log("unpause :user1 balance is :", await schToken.getBalance(user1));

        } catch (e) {
            console.log("test12 is:", await errorDecoder.decode(e))
        }
    })

    it('SCHStake test16 stake lock', async () => {
        try {
            console.log("user1 before balance is :", await schToken.getBalance(user1));

            const tx=await schStake.stakeLock();
            await tx.wait(1)
            /*然后进行质押*/
            await schStake.connect(user2).stake(0, user2, stakeAmount);

            console.log("user1 before balance is :", await schToken.getBalance(user1));
        } catch (e) {
            console.log("test12 is:", await errorDecoder.decode(e))
        }
    })

    it('SCHStake test17 stake unlock', async () => {
        try {
            console.log("user1 before balance is :", await schToken.getBalance(user1));

            const tx=await schStake.stakeUnlock();
            await tx.wait(1)
            /*然后进行质押*/
            await schStake.connect(user1).stake(0, user1, stakeAmount);

            console.log("user1 before balance is :", await schToken.getBalance(user1));
        } catch (e) {
            console.log("test12 is:", await errorDecoder.decode(e))
        }
    })

})