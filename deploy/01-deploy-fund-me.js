// function deployFunc(){
//     console.log("Hi~~");
// }


// module.exports.default= deployFunc;
// module.exports=async (hre)=>{
//     console.log(hre);
//     const {getNamedAccounts,deployments}=hre;
// }

const {network} = require("hardhat");
const {networkConfig} = require("../helper-hardhat-config");
module.exports = async ({deployments,getNamedAccounts}) => {
    const {deploy, log} = deployments;
    const {user} = await getNamedAccounts();

    const chainId =network.config.chainId;

    let aggregatorAddress;
    if (chainId===31337){
        const aggregatorV3 = await deployments.get("MockV3Aggregator");
        aggregatorAddress=aggregatorV3.address;
    }else {
        aggregatorAddress=networkConfig[chainId].ethUsdPriceFeed;
    }
   const fundMeFactory=await deploy("FundMe",{
        contract:"FundMe",
        from:user,
        log:true,
        args:[aggregatorAddress],
    });
    log("FundMe deployed!!");
    if (chainId!==31337){
        await verify(fundMeFactory.address, [aggregatorAddress]);
    }
}

module.exports.tags=["all","fundMe"];