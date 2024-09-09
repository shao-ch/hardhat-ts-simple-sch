
const networkConfig={
    11155111:{
        name:"sepolia",
        ethUsdPriceFeed:"0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
    },

    31337:{
        name:"localhost",
    }
}

NETWORK_NAME=["sepolia","localhost"];

DECIMAL=8;
PRICE=200000000000;

module.exports={
    networkConfig,
    NETWORK_NAME,
    DECIMAL,
    PRICE
}