const {deployments, ethers}=require("hardhat");
const {expect}=require("chai");
describe("Shipping",async function(){

    let shipping;

    before(async function(){
      const shippingDeployment=await deployments.get("Shipping");
        shipping=await ethers.getContractAt("Shipping",shippingDeployment.address);
    })


    it("Should deploy Shipping contract",async function(){
        const status=await shipping.Status();

        console.log(status);
    })


    it("test emit",async function(){
        await expect(shipping.Delivered())
            .to.emit(shipping, "LogNewAlert") // 验证事件被触发
            .withArgs("Your package has arrived"); // 检查事件参数


        const tx=await shipping.Delivered();

       const receipt= await tx.wait(1);
       // console.log(receipt.provider._hardhatProvider)
        //
        const status=await shipping.Status();
        console.log( status)

        const logs=receipt.logs;
        /*find是js数组的一个固有方法*/
        const  a=logs.find(log => log.fragment.name === "LogNewAlert");
        console.log(a.args[0])
        // const logs = await shipping.queryFilter(shipping.filters.LogNewAlert());
        // // const log = receipt.events.find(event => event.event === "LogNewAlert");
        // console.log(logs)
    })
})