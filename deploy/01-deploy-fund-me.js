// function deployFunc(){
//     console.log("Hi~~");
// }


// module.exports.default= deployFunc;
// module.exports=async (hre)=>{
//     console.log(hre);
//     const {getNamedAccounts,deployments}=hre;
// }

const {network} = require("hardhat");
module.exports = async ({deployments,getNamedAccounts}) => {
    const {deploy, log} = deployments;
    const {user} = await getNamedAccounts();

    const {address} = await deployments.get("MockV3Aggregator");

    // const chainId =network.config.chainId;
   const fundMeFactory=await deploy("FundMe",{
        contract:"FundMe",
        from:user,
        log:true,
        args:[address],
    });
    // log(fundMe);
    // const fundMe=await fundMeFactory.deployed();
    // const tx=await fundMe.fund();
    // log(tx);
}

module.exports.tags=["all","fundMe"];