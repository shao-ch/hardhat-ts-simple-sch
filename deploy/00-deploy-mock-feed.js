const env=require("hardhat");

module.exports=async ({deployments,getNamedAccounts})=>{
    const {deploy,log}=deployments;

    const {deployer}= await getNamedAccounts();

    deploy.deploy("MockV3Aggregator",{
        from:deployer,
        /*这里的8,代表单位，代表扩大了多少倍，后面表示price*/
        args:[8,200000000000],
        log:true
    });
    log(deployer);
}