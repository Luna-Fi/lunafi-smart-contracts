const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking", function () {
  it("Should allow owner to Add a stakeType", async function () {
    const Erc20 = await hre.ethers.getContractFactory("lunaToken");
    const erc20 = await Erc20.deploy();
  
    await erc20.deployed();
    console.log("lunaToken deployed to:", erc20.address);
  
    const Staking = await hre.ethers.getContractFactory("lunaFund");
    const staking = await Staking.deploy(erc20.address);
  
    await staking.deployed();
    console.log("staking deployed to:", staking.address);
    
    const stakeTypeID1 = 1
    const stakeTypeID2 = 2
    const stakeTypeID3 = 3
    const term1 = 1
    const term2 = 2
    const term3 = 3
    const percentageReturn1 = 5
    const percentageReturn2 = 10
    const percentageReturn3 = 15
    const penaltyAmount1 = 0
    const penaltyAmount2 = 0
    const penaltyPercentage1 = 0
    const penaltyPercentage2 = 0
    const minAmount = 10000
    const maxAmount = 0
      
    await staking.addStakeType(term1, percentageReturn1, penaltyAmount1, penaltyPercentage1, minAmount, maxAmount)
    await staking.addStakeType(term2, percentageReturn2, penaltyAmount2, penaltyPercentage2, minAmount, maxAmount)
    await staking.addStakeType(term3, percentageReturn3, penaltyAmount2, penaltyPercentage2, minAmount, maxAmount)

    const stakeType1 = await staking.getStakeType(stakeTypeID1)
    const stakeType2 = await staking.getStakeType(stakeTypeID2)
    const stakeType3 = await staking.getStakeType(stakeTypeID3)

    expect(stakeType1.Type).equal(1)
      
    expect(stakeType1.term).equal(1)

    expect(stakeType1.percentageReturn).equal(5)

    expect(stakeType1.minAmount).equal(10000);

    expect(stakeType2.Type).equal(2);

    expect(stakeType2.term).equal(2);

    expect(stakeType2.percentageReturn).equal(10);

    expect(stakeType2.minAmount).equal(10000);

    expect(stakeType3.Type).equal(3);

    expect(stakeType3.term).equal(3);

    expect(stakeType3.percentageReturn).equal(15);

    expect(stakeType3.minAmount).equal(10000);

    //   expect(await erc20.greet()).to.equal("Hello, world!");

    // const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // // wait until the transaction is mined
    // await setGreetingTx.wait();

    // expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
