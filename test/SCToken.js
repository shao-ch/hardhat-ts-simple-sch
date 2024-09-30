const {ethers, upgrades} = require("hardhat")


describe("SCToken", async function () {
    // let owner, user, user1, tokenAddress,scToken;
    // let initTokenCount = 10000;
    // before(async function () {
    //     [owner, user, user1] = await ethers.getSigners();
    //
    //     const scTokenFactory = await ethers.getContractFactory("SCToken", owner);
    //      scToken = await upgrades.deployProxy(scTokenFactory, ["SCToken", initTokenCount, "SCT"], {initializer: "initialize"});
    //     await scToken.waitForDeployment();
    //     tokenAddress = await scToken.getAddress()
    //     console.log("SC Token deployed to:", tokenAddress);
    // })
    /*由于我已经执行过了，所以不在需要部署了，我已经拿到地址了*/
    let owner, user, user1,scToken;
    let tokenAddress = "0xACB20aD7F1f3702a15331b68458476a7C650F5Cf";
    before(async function (){
        [owner, user, user1] =await ethers.getSigners();
        scToken=await ethers.getContractAt("SCToken",tokenAddress)
        console.log(await scToken.getAddress())
    })

    it("test balanceOf", async function () {
        const balance = await scToken.balanceOf(owner)
        console.log("owner:",balance)
    })

    it("test transfer", async function () {
        const balance = await scToken.balanceOf(user)
        console.log("user:",balance)
        console.log("user:",100*10**18)
        const decimals=await scToken.decimals()

        const bigNum1 = await ethers.BigNumber.from("1");
        const bigNum2 = await ethers.BigNumber.from("1");

        // 计算乘积
        const product = bigNum1.mul(bigNum2);
        console.log(product)
        const tx=await scToken.transfer(user,product.toString())
        await tx.wait(1)
        const balanceAfter = await scToken.balanceOf(user)
        console.log("user:",balanceAfter)

    })

    // it("Should deploy and mint tokens", async function () {
    //     [owner,user,user1] = await ethers.getSigners()
    //     const boxV1Factory =await ethers.getContractFactory("BoxV1");
    //
    //     const boxV1=await upgrades.deployProxy(boxV1Factory,[42],{initializer:"store"});
    //     await boxV1.waitForDeployment();
    //     const address=await boxV1.getAddress();
    //
    //     /*这个可以通过地址直接获取对应的实例*/
    //     const upgraded = boxV1.attach(address)
    //     const value = await upgraded.value();
    //
    //     console.log(value)
    //
    //     console.log("boxV1 deployed address:",address)
    //
    //     const boxV2Factory =await ethers.getContractFactory("BoxV2");
    //
    //     const boxV2= await upgrades.upgradeProxy(address,boxV2Factory);
    //     const addressV2=await boxV2.getAddress();
    //     console.log("BoxV2 deployed address:",addressV2)
    //
    //     // 验证功能
    //     console.log("Current Value:", await boxV2.retrieve()); // 应输出 42
    //
    //     // 使用新功能
    //     await boxV2.increment();
    //     console.log("Value after increment:", await boxV2.retrieve());
})
