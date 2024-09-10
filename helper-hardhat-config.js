
const networkConfig={
    31337:{
        name:"localhost"
    },
    1337:{
        name:"ganache"
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