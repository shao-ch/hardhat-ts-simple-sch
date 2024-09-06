const {ethers} = require("hardhat");

async function main() {

   const fundMeContractFactory= await ethers.getContractFactory("FundMe");
   const fundMe=await fundMeContractFactory.deploy();

    await fundMe.fund();
}




main();