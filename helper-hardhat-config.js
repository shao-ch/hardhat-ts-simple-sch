
const networkConfig={
    31337:{
        name:"localhost",
        ethUsdPriceFeed:"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    },
    11155111:{
        name:"sepolia",
        ethUsdPriceFeed:"0x694AA1769357215DE4FAC081bf1f309aDC325306"
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