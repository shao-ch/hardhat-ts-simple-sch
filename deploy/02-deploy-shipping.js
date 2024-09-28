const {} =require("hardhat");



module.exports = async ({deployments, getNamedAccounts}) =>{

    const {deploy}=deployments;
   const {deployer}=await getNamedAccounts();

   await deploy("Shipping",{
        contract:"Shipping",
        from:deployer,
        log:true,
        args:[]
    })

    console.log("Shipping deployed...")
}

module.exports.tags = ["all", "Shipping"];