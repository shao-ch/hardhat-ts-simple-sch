const {ethers, upgrades} = require("hardhat")
const {expect} = require("chai");

describe("SCHStake", async function () {

    /*优先设置本地代币*/
    let owner, user1, user2, schStake, schToken;
    let initFlag = false;

    if (initFlag) {

        before(async () => {
            [owner, user1, user2] = await ethers.getSigners();

            const sCTokenFactory = await ethers.getContractFactory("SCToken");
            const schTokenIns = await upgrades.deployProxy(sCTokenFactory, ["SCToken", 100, "SCT"], {initializer: "initialize"})
            await schTokenIns.waitForDeployment();
            const tokenAddress = await schTokenIns.getAddress();
            schToken = tokenAddress;
            console.log("SCToken deployed to:", tokenAddress);

            const sCHStakeContractFactory = await ethers.getContractFactory("SCHStake");

            try {
                schStake = await upgrades.deployProxy(sCHStakeContractFactory,
                    [tokenAddress, 3], {initializer: "initialize"});
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
            schToken = "0x7cfC440d63D5bb7CBc6e6D2aa77Dc9CC04e6e810";
            schStake = await ethers.getContractAt("SCHStake", "0x53F784096410321344d9E3F929Da432D25BE125c");
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

    it('SCHStake test4 addPool', async () => {
        try {
            const beforeLen = await schStake.getPoolLength();
            console.log("beforeLen is :", beforeLen)
            const tx = await schStake.addPool(20, user1, 0, false, 10);
            tx.wait(1)
            console.log("afterLen is :", await schStake.getPoolLength())
        } catch (e) {
            console.log(e)
        }
    });

    it('SCHStake test5 getPoolLen', async () => {
        try {
            console.log("poolLen is :", await schStake.getPoolLength())
        } catch (e) {
            console.log(e)
        }
    });


    it('SCHStake test6 getPoolByPid', async () => {
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


    it('SCHStake test7 user1 stake 1eth', async () => {
        try {
            //0
            await schStake.connect(user1).stake(0,user1,ethers.parseEther("1"));
            console.log("pid is 0’s pool info :", await schStake.getPool(0))
        } catch (e) {
            if (e.data === undefined || e.data.result === undefined) {
                console.log("test7 is:", e)
            } else {
                console.log("test7 error is:", schStake.interface.parseError(e.data.result))
            }
        }
    });

})