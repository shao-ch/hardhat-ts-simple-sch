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


    const chainId =network.config.chainId;
    if (chainId === 31337){
        deploy.deploy("FundMe",{
            from:user,
            log:true,
            args:[],
        });
    }

}