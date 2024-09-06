# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
1、创建项目：npm init
2、初始化项目：npm install --save-dev hardhat
3、创建一个hardhat项目：yarn hardhat
4、添加依赖：yarn add ethers  @typechain/ethers-v6 @typechain/hardhat @types/chai
4、继续添加依赖：
    1、yarn add dotenv
    2、solhint：检查分析solidity代码是否存在潜在错误用的，安装命令：
    3、npm install -D @chainlink/contracts   预言机获取evm的接口，可以与外界进行交互的api
    4、npm install solc@0.8.24  这个是将sol文件编译成,bin，和abi文件的的工具
    5、npm install -D hardhat-deploy  这个插件方便部署合约及测试，文档还需要安装如下的内容：
      1、 npm install --save-dev @nomicfoundation/hardhat-ethers ethers，封装了ethers的api
      2、 npm install --save-dev  @nomicfoundation/hardhat-ethers hardhat-deploy-ethers ethers 安装hardhat-deploy-ethers，方便配合hardhat-deploy一起使用，文档说的
    6、help-hardhat-config,aave-v3-core这个插件可以获取配置的一些模版，给我们提供一个思路
    7、solidity-coverage ，这个是solidity代码检查的工具。安装命令： yarn add solidity-coverage --dev，具体细节：https://www.npmjs.com/package/solidity-coverage
    8、安装如下命令，因为coverage需要这些包：npm install --save-dev "@nomicfoundation/hardhat-chai-matchers@^2.0.0" "@nomicfoundation/hardhat-ignition-ethers@^0.15.0" "@nomicfoundation/hardhat-network-helpers@^1.0.0" "@nomicfoundation/hardhat-verify@^2.0.0" "@types/mocha@>=9.1.0" "hardhat-gas-reporter@^1.0.8" "ts-node@>=8.0.0" "typechain@^8.3.0" "typescript@>=4.5.0" 
5、运行命令:
1、脚本：yarn hardhat run scripts/deploy.ts 或者  npx hardhat run scripts/deploy.ts  --network [name]
2、执行

备注命令如下：
npx hardhat help  --查看hardhat有哪些命令
npx hardhat test  --执行hardhat测试用例
REPORT_GAS=true npx hardhat test
npx hardhat node
```