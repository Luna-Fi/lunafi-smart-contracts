const {expect} = require("chai");
const {MockProvider} = require("ethereum-waffle");
const {ethers} = require("hardhat");
const {time} = require('openzeppelin-test-helpers');

require("@nomiclabs/hardhat-ethers");
const assert = require('assert').strict;
const {BigNumber} = require("ethers");

const managerRole = ethers.utils.id("MANAGER_ROLE");

const getNumberFromBN = (bn, d) => {
   return BigNumber.from(bn).div(BigNumber.from(10).pow(d)).toNumber();
}

const getBNFromNumber = (num, d) => {
   return BigNumber.from(10).pow(d).mul(num);
}

const formatNumberFromBN = (bn, d) => {
   return (getNumberFromBN(bn, d)).toString().split("").reverse().reduce(function (acc, num, i, orig) {return num + (num != "-" && i && !(i % 3) ? "," : "") + acc;}, "");;
}

function sleep(milliseconds) {
   const date = Date.now();
   let currentDate = null;
   do {
      currentDate = Date.now();
   } while (currentDate - date < milliseconds)
}


describe("vesting", (accounts) => {
   let token, dec;
   let MINUTES_IN_DAY = 1;

   before(async () => {

      [owner, ...accounts] = await ethers.getSigners();
      Erc20 = await hre.ethers.getContractFactory("LFIToken");
      token = await Erc20.deploy();
      dec = await token.decimals();

      await token.deployed();
      console.log("LFIToken deployed to:", token.address);

      const timenow = parseInt((new Date()).getTime() / 1000);
      const startTime = timenow + 5 * MINUTES_IN_DAY * 60;

      SimpleVesting = await hre.ethers.getContractFactory("vesting");
      Vesting = await SimpleVesting.deploy(token.address, startTime);

      await Vesting.deployed();
      console.log("vesting contract deployed to:", Vesting.address);
   });

   it('Check Manager Role', async () => {
      expect(await Vesting.hasRole(managerRole, owner.address)).to.equal(true);
      console.log("Owner " + owner.address + " is Manager");
   });

   it('Check balance of owner before vesting', async () => {
      const ownerBalance = await token.balanceOf(owner.address);
      console.log("Owner balance before vesting : " + formatNumberFromBN(ownerBalance, dec));

      await token.approve(Vesting.address, getBNFromNumber(100000, dec));
   });

   it('Check vesting status', async () => {
      const startTime = await Vesting.getStartTime();
      console.log("Vesting start time : " + startTime.toNumber());

      const vestingScheduleCounter = await Vesting.getVestingAccountsCount();
      console.log("Vesting counts : " + vestingScheduleCounter.toNumber());

      const vestingTotalAmount = await Vesting.getVestingTotalAmount();
      console.log("Vesting total amount : " + formatNumberFromBN(vestingTotalAmount, dec));

      console.log("\n");
      for (let i = 0; i < vestingScheduleCounter; i++) {
         const vestingSchedule = await Vesting.getVestingScheduleById(i);

         console.log("\tVesting ID: ", vestingSchedule.vestingId.toNumber());
         console.log("\tRecipient: ", vestingSchedule.recipient.toString());
         console.log("\tPeriod: ", vestingSchedule.vestingPeriod.toNumber() / MINUTES_IN_DAY / 60);
         console.log("\tAmount: ", formatNumberFromBN(vestingSchedule.allocatedAmount, dec));
      }
      console.log("\n");
   });

   it('Check Account Balances Before Vesting', async () => {
      const balanceOfAccount0 = await token.balanceOf(accounts[0].address);
      const balanceOfAccount1 = await token.balanceOf(accounts[1].address);
      const balanceOfAccount2 = await token.balanceOf(accounts[2].address);
      const balanceOfAccount3 = await token.balanceOf(accounts[3].address);

      console.log("account0, " + accounts[0].address + " : " + formatNumberFromBN(balanceOfAccount0, dec));
      console.log("account1, " + accounts[1].address + " : " + formatNumberFromBN(balanceOfAccount1, dec));
      console.log("account2, " + accounts[2].address + " : " + formatNumberFromBN(balanceOfAccount2, dec));
      console.log("account3, " + accounts[3].address + " : " + formatNumberFromBN(balanceOfAccount3, dec));
   });

   it("Should fail to run transferVestedTokens before vesting has started", async () => {
      await time.increase(1 * MINUTES_IN_DAY * 60);

      await expect(Vesting.transferVestedTokens()).to.be.reverted;

      console.log("Balance of accounts after 1 day");
      const balanceOfAccount0 = await token.balanceOf(accounts[0].address);
      const balanceOfAccount1 = await token.balanceOf(accounts[1].address);
      const balanceOfAccount2 = await token.balanceOf(accounts[2].address);
      const balanceOfAccount3 = await token.balanceOf(accounts[3].address);

      console.log("account0 : " + formatNumberFromBN(balanceOfAccount0, dec));
      console.log("account1 : " + formatNumberFromBN(balanceOfAccount1, dec));
      console.log("account2 : " + formatNumberFromBN(balanceOfAccount2, dec));
      console.log("account3 : " + formatNumberFromBN(balanceOfAccount3, dec));
   });


   it("Deposit token from manager to contract after 14 days", async () => {
      await time.increase(14 * MINUTES_IN_DAY * 60);

      console.log("Balance of owner and contract");
      console.log("Before deposit: ")
      let ownerBalance = await token.balanceOf(owner.address);
      let contractBalance = await token.balanceOf(Vesting.address);
      console.log("owner : " + formatNumberFromBN(ownerBalance, dec));
      console.log("contract : " + formatNumberFromBN(contractBalance, dec));

      await expect(Vesting.connect(owner).depositVestingAmount(getBNFromNumber(100000, dec))).to.be.not.reverted;
      console.log("Deposit 100,000 tokens to vesting contract");

      console.log("After deposit")
      ownerBalance = await token.balanceOf(owner.address);
      contractBalance = await token.balanceOf(Vesting.address);
      console.log("owner : " + formatNumberFromBN(ownerBalance, dec));
      console.log("contract : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Should successfully transfer after 20 days", async () => {
      await time.increase(20 * MINUTES_IN_DAY * 60);

      await expect(Vesting.transferVestedTokens()).to.be.not.reverted;

      const balanceOfAccount0 = await token.balanceOf(accounts[0].address);
      const balanceOfAccount1 = await token.balanceOf(accounts[1].address);
      const balanceOfAccount2 = await token.balanceOf(accounts[2].address);
      const balanceOfAccount3 = await token.balanceOf(accounts[3].address);

      console.log("account0 : " + formatNumberFromBN(balanceOfAccount0, dec));
      console.log("account1 : " + formatNumberFromBN(balanceOfAccount1, dec));
      console.log("account2 : " + formatNumberFromBN(balanceOfAccount2, dec));
      console.log("account3 : " + formatNumberFromBN(balanceOfAccount3, dec));

      const contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance after vesting : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Should successfully transfer vested tokens after 60 days", async () => {
      await time.increase(60 * MINUTES_IN_DAY * 60);

      await expect(Vesting.transferVestedTokens()).to.be.not.reverted;

      const balanceOfAccount0 = await token.balanceOf(accounts[0].address);
      const balanceOfAccount1 = await token.balanceOf(accounts[1].address);
      const balanceOfAccount2 = await token.balanceOf(accounts[2].address);
      const balanceOfAccount3 = await token.balanceOf(accounts[3].address);

      console.log("account0 : " + formatNumberFromBN(balanceOfAccount0, dec));
      console.log("account1 : " + formatNumberFromBN(balanceOfAccount1, dec));
      console.log("account2 : " + formatNumberFromBN(balanceOfAccount2, dec));
      console.log("account3 : " + formatNumberFromBN(balanceOfAccount3, dec));

      const contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance after vesting : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Should successfully transfer after 90 days", async () => {
      await time.increase(90 * MINUTES_IN_DAY * 60);

      await expect(Vesting.transferVestedTokens()).to.be.not.reverted;

      const balanceOfAccount0 = await token.balanceOf(accounts[0].address);
      const balanceOfAccount1 = await token.balanceOf(accounts[1].address);
      const balanceOfAccount2 = await token.balanceOf(accounts[2].address);
      const balanceOfAccount3 = await token.balanceOf(accounts[3].address);

      console.log("account0 : " + formatNumberFromBN(balanceOfAccount0, dec));
      console.log("account1 : " + formatNumberFromBN(balanceOfAccount1, dec));
      console.log("account2 : " + formatNumberFromBN(balanceOfAccount2, dec));
      console.log("account3 : " + formatNumberFromBN(balanceOfAccount3, dec));

      const contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance after vesting : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Should successfully transfer vested tokens after 90 days", async () => {
      await time.increase(90 * MINUTES_IN_DAY * 60);

      await expect(Vesting.transferVestedTokens()).to.be.not.reverted;

      const balanceOfAccount0 = await token.balanceOf(accounts[0].address);
      const balanceOfAccount1 = await token.balanceOf(accounts[1].address);
      const balanceOfAccount2 = await token.balanceOf(accounts[2].address);
      const balanceOfAccount3 = await token.balanceOf(accounts[3].address);

      console.log("account0 : " + formatNumberFromBN(balanceOfAccount0, dec));
      console.log("account1 : " + formatNumberFromBN(balanceOfAccount1, dec));
      console.log("account2 : " + formatNumberFromBN(balanceOfAccount2, dec));
      console.log("account3 : " + formatNumberFromBN(balanceOfAccount3, dec));

      const contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance after vesting : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Should successfully transfer vested tokens after 91 days", async () => {
      await time.increase(91 * MINUTES_IN_DAY * 60);

      await expect(Vesting.transferVestedTokens()).to.be.not.reverted;

      const balanceOfAccount0 = await token.balanceOf(accounts[0].address);
      const balanceOfAccount1 = await token.balanceOf(accounts[1].address);
      const balanceOfAccount2 = await token.balanceOf(accounts[2].address);
      const balanceOfAccount3 = await token.balanceOf(accounts[3].address);

      console.log("account0 : " + formatNumberFromBN(balanceOfAccount0, dec));
      console.log("account1 : " + formatNumberFromBN(balanceOfAccount1, dec));
      console.log("account2 : " + formatNumberFromBN(balanceOfAccount2, dec));
      console.log("account3 : " + formatNumberFromBN(balanceOfAccount3, dec));

      const contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance after vesting : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Should successfully transfer vested tokens after 10 days", async () => {
      await time.increase(10 * MINUTES_IN_DAY * 60);

      await expect(Vesting.transferVestedTokens()).to.be.reverted;

      const balanceOfAccount0 = await token.balanceOf(accounts[0].address);
      const balanceOfAccount1 = await token.balanceOf(accounts[1].address);
      const balanceOfAccount2 = await token.balanceOf(accounts[2].address);
      const balanceOfAccount3 = await token.balanceOf(accounts[3].address);

      console.log("account0 : " + formatNumberFromBN(balanceOfAccount0, dec));
      console.log("account1 : " + formatNumberFromBN(balanceOfAccount1, dec));
      console.log("account2 : " + formatNumberFromBN(balanceOfAccount2, dec));
      console.log("account3 : " + formatNumberFromBN(balanceOfAccount3, dec));

      const contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance after vesting : " + formatNumberFromBN(contractBalance, dec));
   });

})
