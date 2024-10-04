const {ethers, upgrades, getUint} = require("hardhat")


describe("SCToken", async function () {
    // let owner, user, user1, tokenAddress,scToken;
    // let initTokenCount = 10000;
    // before(async function (){
    //     [owner, user, user1] = await ethers.getSigners();
    //
    //     const scTokenFactory = await ethers.getContractFactory("SCToken.sol", owner);
    //     scToken = await upgrades.deployProxy(scTokenFactory, ["SCToken.sol", initTokenCount, "SCT"], {initializer: "initialize"});
    //     await scToken.waitForDeployment();
    //     tokenAddress = await scToken.getAddress()
    //     console.log("SC Token deployed to:", tokenAddress);
    // })


    /*由于我已经执行过了，所以不在需要部署了，我已经拿到地址了*/
    let owner, user, user1, scToken;
    let tokenAddress = "0xE661caAf76591229Cc4aAbc4a753512DeFD3eA5C";
    /*是否升级的标志*/
    let upgradeFlag=false;
    let currentAbi="SCTokenV2";
    before(async function () {
        [owner, user, user1] = await ethers.getSigners();

        //升级token至SCTokenV2
        if (upgradeFlag){
            const scTokenV2Factory = await ethers.getContractFactory("SCTokenV2");
            const scTokenV2= await upgrades.upgradeProxy(tokenAddress, scTokenV2Factory);
            tokenAddress=await scTokenV2.getAddress();
            scToken=scTokenV2;
            console.log("SCTokenV2 deployed to:", tokenAddress);
            return
        }
        try {
            scToken = await ethers.getContractAt(currentAbi, tokenAddress)
        } catch (e) {
            if (e.data === undefined || e.data.result === undefined) {
                console.log("test6 user1ToUserTransfer error is:", e)
            } else {
                console.log("test6 user1ToUserTransfer error is:", scToken.interface.parseError(e.data.result))
            }
            return;
        }
        console.log(await scToken.getAddress())
    })

    it("test0 balanceOf", async function () {
        const balance = await scToken.balanceOf(owner)
        console.log("owner:", balance)
    })

    it("test1: transfer(owner to user)", async function () {
        const balance = await scToken.balanceOf(user)
        console.log("user:", balance)

        // 计算乘积
        const product = 100 * 10 ** 18;
        console.log(product)
        const tx = await scToken.transfer(user, product.toString())
        await tx.wait(1)
        const balanceAfter = await scToken.balanceOf(user)
        console.log("user:", balanceAfter)
    })

    it('test2 allowance(owner to user)', async () => {
        /*给user 设置spender*/
        const product = 200 * 10 ** 18;

        const tx = await scToken.approve(user, product.toString());
        await tx.wait(1)
        const txForAllowance = await scToken.allowance(owner, user)
        console.log("ownerToUser is :", txForAllowance)
    });

    it('test3 allowance(user to owner)', async () => {
        /*给user 设置spender*/
        const product = 200 * 10 ** 18;
        const userConnect = await scToken.connect(user)
        const tx = await userConnect.approve(owner, product.toString());
        await tx.wait(1)
        const txForAllowance = await scToken.allowance(user, owner)
        console.log("userToOwner is :", txForAllowance)
    });


    it('test4 transfer(user to owner)', async () => {
        const product = 200 * 10 ** 18;

        //首先:owner->user用户转账200
        try {
            const tx = await scToken.transfer(user, product.toString())
            await tx.wait(1)
        } catch (e) {
            if (e.data === undefined || e.data.result === undefined) {
                console.log("ownerToUer token error is:", e)
            } else {
                console.log("ownerToUer token error is:", userConnect.interface.parseError(e.data.result))
            }
            return;
        }
        try {
            /*设置user给owner的允许值*/
            const userConnect = await scToken.connect(user)
            const allowTx = await userConnect.approve(owner, product.toString());
            await allowTx.wait(1)
            console.log("allowTx resp:", allowTx)
        } catch (e) {
            if (e.data === undefined || e.data.result === undefined) {
                console.log("allowTx error is:", e)
            } else {
                console.log("allowTx error is:", userConnect.interface.parseError(e.data.result))
            }
            return;
        }
        //查询 allowance
        console.log("allowance user to owner:", ethers.formatEther(await scToken.allowance(user, owner)))

        /*查询两个账户的余额*/
        console.log("before owner:", ethers.formatEther(await scToken.balanceOf(owner)))
        console.log("before user:", ethers.formatEther(await scToken.balanceOf(user)))

        /*进行 user to owner 的转账*/
        try {
            const tx = await scToken.transferFrom(user, owner, product.toString())
            await tx.wait(1)
        } catch (e) {
            if (e.data === undefined || e.data.result === undefined) {
                console.log("test4 transferFrom error is:", e)
            } else {
                console.log("test4 transferFrom error is:", scToken.interface.parseError(e.data.result))
            }
            return;
        }
        console.log("after owner:", ethers.formatEther(await scToken.balanceOf(owner)))
        console.log("after user:", ethers.formatEther(await scToken.balanceOf(user)))

    });


    it('test5 transfer(user to owner not set allowance)', async () => {
        //owner to user transfer

        const product = ethers.parseEther("200");

        console.log("before owner balance:", ethers.formatEther(await scToken.balanceOf(owner)))
        console.log("before user balance:", ethers.formatEther(await scToken.balanceOf(user)))

        try {
            const ownerToUserTx = await scToken.transfer(user, product);
            ownerToUserTx.wait(1)
        } catch (e) {
            if (e.data === undefined || e.data.result === undefined) {
                console.log("test5 transferFrom error is:", e)
            } else {
                console.log("test5 transferFrom error is:", scToken.interface.parseError(e.data.result))
            }
            return;
        }

        console.log("afterV1 owner balance:", ethers.formatEther(await scToken.balanceOf(owner)))
        console.log("afterV1 user balance:", ethers.formatEther(await scToken.balanceOf(user)))

        const userScToken = scToken.connect(user)
        try {
            const tx = await userScToken.transfer(owner, product);
            await tx.wait(1)
        } catch (e) {
            if (e.data === undefined || e.data.result === undefined) {
                console.log("test5 transferFrom error is:", e)
            } else {
                console.log("test5 transferFrom error is:", userScToken.interface.parseError(e.data.result))
            }
            return;
        }

        console.log("afterV2 owner balance:", ethers.formatEther(await scToken.balanceOf(owner)))
        console.log("afterV2 user balance:", ethers.formatEther(await scToken.balanceOf(user)))

        //user to owner transfer not set allowance

    });


    it('test6 transfer(user to user1 set allowance)', async () => {
        const product = ethers.parseEther("200");
        //从owner给user 转账500eth
        var flag=true;
       if (flag){
           try {
               const ownerToUserTx = await scToken.transfer(user, product)
               await ownerToUserTx.wait(1)
           } catch (e) {
               if (e.data === undefined || e.data.result === undefined) {
                   console.log("test6 ownerToUserTx transferFrom error is:", e)
               } else {
                   console.log("test6 ownerToUserTx transferFrom error is:", scToken.interface.parseError(e.data.result))
               }
               return;
           }
       }
        //切换账号到 user
        const userScToken = scToken.connect(user);
        console.log("before user balance:", ethers.formatEther(await scToken.balanceOf(user)))
        console.log("before user1 balance:", ethers.formatEther(await scToken.balanceOf(user1)))

        //然后user->user1  转了200eth
        try {
            const userToUser1Tx = await userScToken.transfer(user1, product)
            await userToUser1Tx.wait(1)
        } catch (e) {
            if (e.data === undefined || e.data.result === undefined) {
                console.log("test6 transferFrom error is:", e)
            } else {
                console.log("test6 transferFrom error is:", userScToken.interface.parseError(e.data.result))
            }
            return;
        }

        console.log("afterV1 user balance:", ethers.formatEther(await scToken.balanceOf(user)))
        console.log("afterV1 user1 balance:", ethers.formatEther(await scToken.balanceOf(user1)))
        //设置allowance user1 to user1 200eth
        try {
            const user1ScToken = scToken.connect(user1);
            //这里必须设置，user1允许给use转200eth
            await user1ScToken.approve(user, product);
            //因为要最后还给owner，所以要设置user1允许给owner转200eth
            await user1ScToken.approve(owner, product);
        } catch (e) {
            if (e.data === undefined || e.data.result === undefined) {
                console.log("test6 user1Allowance error is:", e)
            } else {
                console.log("test6 user1Allowance error is:", userScToken.interface.parseError(e.data.result))
            }
            return;
        }
        //user1->user 200eth的转账
        try {
            const user1ToUserTransfer =await userScToken.transferFrom(user1, user, product)
            user1ToUserTransfer.wait(1)
        } catch (e) {
            if (e.data === undefined || e.data.result === undefined) {
                console.log("test6 user1ToUserTransfer error is:", e)
            } else {
                console.log("test6 user1ToUserTransfer error is:", userScToken.interface.parseError(e.data.result))
            }
            return;
        }

        console.log("afterV2 user balance:", ethers.formatEther(await scToken.balanceOf(user)))
        console.log("afterV2 user1 balance:", ethers.formatEther(await scToken.balanceOf(user1)))

        //ether user 转给owner 200eth

        try {
            await userScToken.approve(owner, product)
            console.log("user allowance owner token is :", ethers.formatEther(await scToken.allowance(user, owner)))

            const tx1 = await scToken.transferFrom(user, owner,product)
            await tx1.wait(1)
        } catch (e) {
            if (e.data === undefined || e.data.result === undefined) {
                console.log("test6 tx1 error is:", e)
            } else {
                console.log("test6 tx1 error is:", userScToken.interface.parseError(e.data.result))
            }
            return;
        }
        console.log("afterV2 owner balance:", ethers.formatEther(await scToken.balanceOf(owner)))
        console.log("afterV2 user balance:", ethers.formatEther(await scToken.balanceOf(user)))
        console.log("afterV2 user1 balance:", ethers.formatEther(await scToken.balanceOf(user1)))
    });

    it('test7 test onlyOwner', async () => {
        const product = ethers.parseEther("500");
        //因为初次部署在owner上，所以这里我用user账号去进行销毁代币,就会报错
        try {
            const tx = await scToken.connect(user).burn(product);
            tx.wait(1)
        } catch (e) {
            if (e.data === undefined || e.data.result === undefined) {
                console.log("test7 onlyOwner error is:", e)
            } else {
                console.log("test7 onlyOwner error is:", scToken.interface.parseError(e.data.result))
            }
        }
    });

    //降低代币的总量,别一直点击，一直点总量就会一直减少
    it("test8 destroy eth from owner ", async () => {
        const product = ethers.parseEther("500");
        console.log("before owner balance:", ethers.formatEther(await scToken.balanceOf(owner)))

        try {
            const tx = await scToken.burn(product);
            tx.wait(1)
        } catch (e) {
            if (e.data === undefined || e.data.result === undefined) {
                console.log("test7 destroy eth error is:", e)
            } else {
                console.log("test7 destroy eth error is:", scToken.interface.parseError(e.data.result))
            }
            return;
        }
        console.log("after owner balance:", ethers.formatEther(await scToken.balanceOf(owner)))
    });

    it('test9 create token from owner', async () => {
        const product = ethers.parseEther("500");
        console.log("before owner balance:", ethers.formatEther(await scToken.balanceOf(owner)))

        try {
            const tx = await scToken.mint(product);
            tx.wait(1)
        } catch (e) {
            if (e.data === undefined || e.data.result === undefined) {
                console.log("test8 create eth error is:", e)
            } else {
                console.log("test8 create eth error is:", scToken.interface.parseError(e.data.result))
            }
            return;
        }
        console.log("after owner balance:", ethers.formatEther(await scToken.balanceOf(owner)))

    });

})
