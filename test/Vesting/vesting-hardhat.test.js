const { expect } = require("chai");
const { MockProvider } = require("ethereum-waffle");
const { ethers } = require("hardhat");
const { time } = require('openzeppelin-test-helpers');

require("@nomiclabs/hardhat-ethers");
const assert = require('assert').strict;
const { BigNumber } = require("ethers");

const managerRole = ethers.utils.id("MANAGER_ROLE");

const getNumberFromStrBN = (str_bn, dec) => {
   let val = 0;
   for (let i = 0; i < str_bn.length; i++) {
      if (str_bn.substr(str_bn.length - 1 - i, 1) !== '0') {
         val = parseInt(str_bn.substr(0, str_bn.length - i)) / Math.pow(10, dec - i);
         break;
      }
   }
   return val;
};

const getNumberFromBN = (bn, d) => {
   const num1 = BigNumber.from(bn)
   const num2 = BigNumber.from(10).pow(d);
   const num3 = num1.mod(num2);
   const num4 = num1.sub(num3).div(num2);
   return num4.toNumber() + getNumberFromStrBN(num3.toString(), d);
}

const getBNFromNumber = (num, d) => {
   return BigNumber.from(10).pow(d).mul(num);
}

const formatNumberFromBN = (bn, d) => {
   const str = (getNumberFromBN(bn, d)).toString().replace(/\.0+$/, '');
   const str1 = str.split(".")[0];
   const str2 = str.split(".")[1] ? "." + str.split(".")[1] : '';
   return str1.split("").reverse().reduce(function (acc, num, i, orig) { return num + (num !== "-" && i && !(i % 3) ? "," : "") + acc; }, "") + str2;
}

function sleep(milliseconds) {
   const date = Date.now();
   let currentDate = null;
   do {
      currentDate = Date.now();
   } while (currentDate - date < milliseconds)
}


contract("vesting", (accounts) => {
   let token, dec, SimpleVesting, Vesting, vestingScheduleCounter;
   let MINUTES_IN_DAY = 1;

   before(async () => {

      [owner, account35, account36, account37] = await ethers.getSigners();
      accounts = [
         '0x27106C0f5c450ED30B4547681992709808964600',
         '0xFdA31099FcB1Fc146B7bd93dd99dD7F6c081c560',
         '0x00e294652292776e4d59F416ef35a73Cae0e01dc',
         '0x8959f1D534C83a3031ef4b8E5aAF0C2aB954ddE4',
         '0xBCB5BA11f7Aa02dF7d7e607Ec83F3F24880807A1',
         '0xBc9F27d42D2D9dFb3Ea58DAE8dfb22Dc9934E0fd',
         '0xe96703DbE09AA2f3F172c01D0fbD6F4408Ff83C2',
         '0xaD6f284437367357f9d4C825D95a7122E4AD60aB',
         '0x9c999F738693AB7d5fAEbDdd7B0f1564DADEAB00',
         '0xce46f9aFb2cD26030021c24DC1AB52116B19B68A',
         '0x555187752Ef6d73758862B5d364AAB362c996d0e',
         '0x5E46884a77E0aC5F3126e30720Bd5218814dc5E2',
         '0xF49779d278F9b25e0Ac50c44CaD48ca74e50D043',
         '0xfE27c67D7a05E7D6c9C83672454a7dB7F1fD3eF1',
         '0x6F557741B2E0f1ED9563e1088f257C0086B5C8b0',
         '0xEC4636Af52275d303B71F2544389e363A0619234',
         '0xcF808867dFd2bFfb9444cf9981C3a2c2B984b330',
         '0xE0C6023B6c292D23f41dCEE3424cD24547DDca90',
         '0xc8c8559ab47C68B2A5f24D8F559Ae95290Cd68DF',
         '0xdd930D3453FbEfd41938e2048a6fb49c7d3cC71F',
         '0x5e351A2387512b4C19C78b530Fc872925362d37F',
         '0x824F0e73561D2E154F8e54dCA2987f960114C601',
         '0x28aD1D1559f0ff9a9EcF4e261305B5811b8786f5',
         '0x2bC474A6285527c708827f924333e904860fFa86',
         '0x85b0157c74D77c5952fA31f9e2a55025a09f697e',
         '0x3Cd734d663AaF9d51Da45f14019dfC4EcAfEad73',
         '0x8b47e534964ec0389138b43ca39f598f18806fEC',
         '0xCb2052f7cB59BcBD77f0ec8Ae27Ef61B39fF57C3',
         '0x49A323CC2fa5F9A138f30794B9348e43065D8dA2',
         '0x265C50DDc99C986912D4f7Cc8357303baeEB01d9',
         '0xA9F28648CaB79322fB50912Ae00D68E5dc5E704f',
         '0xA37e4eF510150E942Def77B79d262D5Fb31299EE',
         '0x1fcd4F6046FE53F914d7E7379CeE359790b0e9ff',
         '0x09A855d54C987D8e437A975f92A4E4F10bAB235c',
         '0x16F700f8713Ca47c6693DbDD814126f7a1704f87',
         account35.address.toString(),
         account36.address.toString()
      ];
      Erc20 = await hre.ethers.getContractFactory("LFIToken");
      token = await Erc20.deploy();
      dec = await token.decimals();

      await token.deployed();
      console.log("LFIToken deployed to:", token.address);

      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timenow = block.timestamp;

      const startTime = timenow + 5 * MINUTES_IN_DAY * 60;

      SimpleVesting = await hre.ethers.getContractFactory("vesting");
      Vesting = await SimpleVesting.deploy(token.address, startTime);

      await Vesting.deployed();
      console.log("vesting contract deployed to:", Vesting.address);
   });

   it('Check Manager Role', async () => {
      console.log("\n");
      console.log("\n");
      expect(await Vesting.hasRole(managerRole, owner.address)).to.equal(true);
      console.log("Owner " + owner.address + " is Manager");
   });

   it('Check balance of owner before vesting', async () => {
      console.log("\n");
      const ownerBalance = await token.balanceOf(owner.address);
      console.log("Owner balance before vesting : " + formatNumberFromBN(ownerBalance, dec));

      await token.approve(Vesting.address, ownerBalance);
   });

   it('Check vesting status', async () => {
      console.log("\n");
      const startTime = await Vesting.getStartTime();
      console.log("Vesting start time : " + startTime.toNumber());

      vestingScheduleCounter = await Vesting.getVestingAccountsCount();
      console.log("Vesting counts : " + vestingScheduleCounter.toNumber());

      const vestingTotalAmount = await Vesting.getTotalVestingAmount();
      console.log("Vesting total amount : " + formatNumberFromBN(vestingTotalAmount, dec));

      console.log("\n");
      for (let i = 0; i < vestingScheduleCounter; i++) {
         if (i === 0) console.log("\t- Team");
         if (i === 9) console.log("\t- Seed");
         if (i === 21) console.log("\t- Strategic");
         if (i === 33) console.log("\t- Advisory");
         const vestingSchedule = await Vesting.getVestingScheduleById(i + 1);

         console.log("\tVesting ID: ", vestingSchedule.vestingId.toNumber());
         console.log("\tRecipient: ", vestingSchedule.recipient.toString());
         console.log("\tPeriod: ", vestingSchedule.vestingPeriod.toNumber() / MINUTES_IN_DAY / 60);
         console.log("\tAmount: ", formatNumberFromBN(vestingSchedule.allocatedAmount, dec));
      }
      console.log("\n");
   });

   it('Check Account Balances Before Vesting', async () => {
      console.log("\n");
      for (let i = 0; i < vestingScheduleCounter; i++) {
         if (i === 0) console.log("- Team");
         if (i === 9) console.log("- Seed");
         if (i === 21) console.log("- Strategic");
         if (i === 33) console.log("- Advisory");

         const balanceOfAccount = await token.balanceOf(accounts[i]);

         console.log(`account${i}, ` + accounts[i] + " : " + formatNumberFromBN(balanceOfAccount, dec));
      }
   });

   it("Time increased", async () => {
      console.log("\n");
      await time.increase(1 * MINUTES_IN_DAY * 60);
      console.log("----------------------------- 1 days -----------------------------");
   });

   it("Should fail to run transferVestedTokens before vesting has started", async () => {
      console.log("\n");
      await expect(Vesting.transferVestedTokens()).to.be.reverted;

      console.log("Balance of accounts");
      for (let i = 0; i < vestingScheduleCounter; i++) {
         if (i === 0) console.log("- Team");
         if (i === 9) console.log("- Seed");
         if (i === 21) console.log("- Strategic");
         if (i === 33) console.log("- Advisory");

         const balanceOfAccount = await token.balanceOf(accounts[i]);

         console.log(`account${i} : ` + formatNumberFromBN(balanceOfAccount, dec));
      }
   });

   it("Time increased", async () => {
      console.log("\n");
      await time.increase(14 * MINUTES_IN_DAY * 60);
      console.log("----------------------------- 14 days -----------------------------");
   });

   it("Deposit token from manager to contract", async () => {
      console.log("\n");
      console.log("Balance of owner and contract");
      console.log("Before deposit: ")
      let ownerBalance = await token.balanceOf(owner.address);
      let contractBalance = await token.balanceOf(Vesting.address);
      console.log("owner : " + formatNumberFromBN(ownerBalance, dec));
      console.log("contract : " + formatNumberFromBN(contractBalance, dec));

      await expect(Vesting.connect(owner).depositVestingAmount(getBNFromNumber(3055199999985, dec - 4))).to.be.not.reverted;
      console.log(`Deposit 305,519,999.9985 tokens to vesting contract`);

      console.log("After deposit")
      ownerBalance = await token.balanceOf(owner.address);
      contractBalance = await token.balanceOf(Vesting.address);
      console.log("owner : " + formatNumberFromBN(ownerBalance, dec));
      console.log("contract : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Time increased", async () => {
      console.log("\n");
      await time.increase(20 * MINUTES_IN_DAY * 60);
      console.log("----------------------------- 20 days -----------------------------");
   });

   it("Account 35 should fail to claim before cliff", async () => {
      console.log("\n");
      let balanceOfAccount = await token.balanceOf(account35.address);
      console.log(`Before claiming, account35 : ` + formatNumberFromBN(balanceOfAccount, dec));
      let contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance : " + formatNumberFromBN(contractBalance, dec));

      await expect(Vesting.connect(account35).claim()).to.be.reverted;

      balanceOfAccount = await token.balanceOf(account35.address);
      console.log(`After claiming, account35 : ` + formatNumberFromBN(balanceOfAccount, dec));
      contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Owner should successfully transfer", async () => {
      console.log("\n");
      await expect(Vesting.transferVestedTokens()).to.be.not.reverted;

      for (let i = 0; i < vestingScheduleCounter; i++) {
         if (i === 0) console.log("- Team");
         if (i === 9) console.log("- Seed");
         if (i === 21) console.log("- Strategic");
         if (i === 33) console.log("- Advisory");

         const balanceOfAccount = await token.balanceOf(accounts[i]);

         console.log(`account${i} : ` + formatNumberFromBN(balanceOfAccount, dec));
      }

      const contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance after vesting : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Time increased", async () => {
      console.log("\n");
      await time.increase(1 * MINUTES_IN_DAY * 60);
      console.log("----------------------------- 1 days -----------------------------");
   });

   it("Account 36 should successfully claim just after cliff", async () => {
      console.log("\n");
      let balanceOfAccount = await token.balanceOf(account36.address);
      console.log(`Before claiming, account36 : ` + formatNumberFromBN(balanceOfAccount, dec));
      let contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance : " + formatNumberFromBN(contractBalance, dec));
      let claimableAmount = await Vesting.getClaimable(account36.address);
      console.log("Claimable Amount : " + formatNumberFromBN(claimableAmount, dec));

      await expect(Vesting.connect(account36).claim()).to.be.not.reverted;

      balanceOfAccount = await token.balanceOf(account36.address);
      console.log(`After claiming, account36 : ` + formatNumberFromBN(balanceOfAccount, dec));
      contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Time increased", async () => {
      console.log("\n");
      await time.increase(4 * MINUTES_IN_DAY * 60);
      console.log("----------------------------- 4 days -----------------------------");
   });

   it("Account 36 should successfully claim", async () => {
      console.log("\n");
      let balanceOfAccount = await token.balanceOf(account36.address);
      console.log(`Before claiming, account36 : ` + formatNumberFromBN(balanceOfAccount, dec));
      let contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance : " + formatNumberFromBN(contractBalance, dec));
      let claimableAmount = await Vesting.getClaimable(account36.address);
      console.log("Claimable Amount : " + formatNumberFromBN(claimableAmount, dec));

      await expect(Vesting.connect(account36).claim()).to.be.not.reverted;

      balanceOfAccount = await token.balanceOf(account36.address);
      console.log(`After claiming, account36 : ` + formatNumberFromBN(balanceOfAccount, dec));
      contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Time increased", async () => {
      console.log("\n");
      await time.increase(10 * MINUTES_IN_DAY * 60);
      console.log("----------------------------- 10 days -----------------------------");
   });

   it("Account 36 should successfully claim", async () => {
      console.log("\n");
      let balanceOfAccount = await token.balanceOf(account36.address);
      console.log(`Before claiming, account36 : ` + formatNumberFromBN(balanceOfAccount, dec));
      let contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance : " + formatNumberFromBN(contractBalance, dec));
      let claimableAmount = await Vesting.getClaimable(account36.address);
      console.log("Claimable Amount : " + formatNumberFromBN(claimableAmount, dec));

      await expect(Vesting.connect(account36).claim()).to.be.not.reverted;

      balanceOfAccount = await token.balanceOf(account36.address);
      console.log(`After claiming, account36 : ` + formatNumberFromBN(balanceOfAccount, dec));
      contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Time increased", async () => {
      console.log("\n");
      await time.increase(20 * MINUTES_IN_DAY * 60);
      console.log("----------------------------- 20 days -----------------------------");
   });

   it("Account 36 should successfully claim and redirect the transfer", async () => {
      console.log("\n");
      let balanceOfAccount36 = await token.balanceOf(account36.address);
      console.log(`Before claiming, account36 : ` + formatNumberFromBN(balanceOfAccount36, dec));
      let balanceOfAccount35 = await token.balanceOf(account35.address);
      console.log(`Before claiming, account35 : ` + formatNumberFromBN(balanceOfAccount35, dec));
      let contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance : " + formatNumberFromBN(contractBalance, dec));
      let claimableAmount = await Vesting.getClaimable(account36.address);
      console.log("Claimable Amount : " + formatNumberFromBN(claimableAmount, dec));

      await expect(Vesting.connect(account36).claimTo(account35.address)).to.be.not.reverted;

      balanceOfAccount36 = await token.balanceOf(account36.address);
      console.log(`After claiming, account36 : ` + formatNumberFromBN(balanceOfAccount36, dec));
      balanceOfAccount35 = await token.balanceOf(account35.address);
      console.log(`After claiming, account35 : ` + formatNumberFromBN(balanceOfAccount35, dec));
      contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Time increased", async () => {
      console.log("\n");
      await time.increase(26 * MINUTES_IN_DAY * 60);
      console.log("----------------------------- 26 days -----------------------------");
   });

   it("Should successfully transfer vested tokens", async () => {
      console.log("\n");
      await expect(Vesting.transferVestedTokens()).to.be.not.reverted;

      for (let i = 0; i < vestingScheduleCounter; i++) {
         if (i === 0) console.log("- Team");
         if (i === 9) console.log("- Seed");
         if (i === 21) console.log("- Strategic");
         if (i === 33) console.log("- Advisory");

         const balanceOfAccount = await token.balanceOf(accounts[i]);

         console.log(`account${i} : ` + formatNumberFromBN(balanceOfAccount, dec));
      }

      const contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance after vesting : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Time increased", async () => {
      console.log("\n");
      await time.increase(91 * MINUTES_IN_DAY * 60);
      console.log("----------------------------- 91 days -----------------------------");
   });

   it("Should successfully transfer", async () => {
      console.log("\n");
      await expect(Vesting.transferVestedTokens()).to.be.not.reverted;

      for (let i = 0; i < vestingScheduleCounter; i++) {
         if (i === 0) console.log("- Team");
         if (i === 9) console.log("- Seed");
         if (i === 21) console.log("- Strategic");
         if (i === 33) console.log("- Advisory");

         const balanceOfAccount = await token.balanceOf(accounts[i]);

         console.log(`account${i} : ` + formatNumberFromBN(balanceOfAccount, dec));
      }

      const contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance after vesting : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Time increased", async () => {
      console.log("\n");
      await time.increase(183 * MINUTES_IN_DAY * 60);
      console.log("----------------------------- 183 days -----------------------------");
   });

   it("Should successfully transfer vested tokens", async () => {
      console.log("\n");
      await expect(Vesting.transferVestedTokens()).to.be.not.reverted;

      for (let i = 0; i < vestingScheduleCounter; i++) {
         if (i === 0) console.log("- Team");
         if (i === 9) console.log("- Seed");
         if (i === 21) console.log("- Strategic");
         if (i === 33) console.log("- Advisory");

         const balanceOfAccount = await token.balanceOf(accounts[i]);

         console.log(`account${i} : ` + formatNumberFromBN(balanceOfAccount, dec));
      }

      const contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance after vesting : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Time increased", async () => {
      console.log("\n");
      await time.increase(183 * MINUTES_IN_DAY * 60);
      console.log("----------------------------- 183 days -----------------------------");
   });

   it("Account 37 should fail to claim", async () => {
      console.log("\n");
      let balanceOfAccount = await token.balanceOf(account37.address);
      console.log(`Before claiming, account37 : ` + formatNumberFromBN(balanceOfAccount, dec));
      let contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance : " + formatNumberFromBN(contractBalance, dec));

      await expect(Vesting.connect(account37).claim()).to.be.reverted;

      balanceOfAccount = await token.balanceOf(account37.address);
      console.log(`After claiming, account37 : ` + formatNumberFromBN(balanceOfAccount, dec));
      contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Account 35 should success to claim", async () => {
      console.log("\n");
      let balanceOfAccount = await token.balanceOf(account35.address);
      console.log(`Before claiming, account35 : ` + formatNumberFromBN(balanceOfAccount, dec));
      let contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance : " + formatNumberFromBN(contractBalance, dec));
      let claimableAmount = await Vesting.getClaimable(account36.address);
      console.log("Claimable Amount : " + formatNumberFromBN(claimableAmount, dec));

      await expect(Vesting.connect(account35).claim()).to.be.not.reverted;

      balanceOfAccount = await token.balanceOf(account35.address);
      console.log(`After claiming, account35 : ` + formatNumberFromBN(balanceOfAccount, dec));
      contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Time increased", async () => {
      console.log("\n");
      await time.increase(182 * MINUTES_IN_DAY * 60);
      console.log("----------------------------- 182 days -----------------------------");
   });

   it("Should successfully transfer vested tokens", async () => {
      console.log("\n");
      await expect(Vesting.transferVestedTokens()).to.be.not.reverted;

      for (let i = 0; i < vestingScheduleCounter; i++) {
         if (i === 0) console.log("- Team");
         if (i === 9) console.log("- Seed");
         if (i === 21) console.log("- Strategic");
         if (i === 33) console.log("- Advisory");

         const balanceOfAccount = await token.balanceOf(accounts[i]);

         console.log(`account${i} : ` + formatNumberFromBN(balanceOfAccount, dec));
      }

      const contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance after vesting : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Time increased", async () => {
      console.log("\n");
      await time.increase(365 * MINUTES_IN_DAY * 60);
      console.log("----------------------------- 365 days -----------------------------");
   });

   it("Should successfully transfer vested tokens", async () => {
      console.log("\n");
      await expect(Vesting.transferVestedTokens()).to.be.not.reverted;

      for (let i = 0; i < vestingScheduleCounter; i++) {
         if (i === 0) console.log("- Team");
         if (i === 9) console.log("- Seed");
         if (i === 21) console.log("- Strategic");
         if (i === 33) console.log("- Advisory");

         const balanceOfAccount = await token.balanceOf(accounts[i]);

         console.log(`account${i} : ` + formatNumberFromBN(balanceOfAccount, dec));
      }

      const contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance after vesting : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Time increased", async () => {
      console.log("\n");
      await time.increase(10 * MINUTES_IN_DAY * 60);
      console.log("----------------------------- 10 days -----------------------------");
   });

   it("Should successfully transfer vested tokens", async () => {
      console.log("\n");
      await expect(Vesting.transferVestedTokens()).to.be.reverted;

      for (let i = 0; i < vestingScheduleCounter; i++) {
         if (i === 0) console.log("- Team");
         if (i === 9) console.log("- Seed");
         if (i === 21) console.log("- Strategic");
         if (i === 33) console.log("- Advisory");

         const balanceOfAccount = await token.balanceOf(accounts[i]);

         console.log(`account${i} : ` + formatNumberFromBN(balanceOfAccount, dec));
      }

      const contractBalance = await token.balanceOf(Vesting.address);
      console.log("Contract balance after vesting : " + formatNumberFromBN(contractBalance, dec));
   });

   it("Withdraw token from contract", async () => {
      console.log("\n");
      console.log("Balance of owner and contract");
      console.log("Before Withdraw: ")
      let ownerBalance = await token.balanceOf(owner.address);
      let contractBalance = await token.balanceOf(Vesting.address);
      console.log("owner : " + formatNumberFromBN(ownerBalance, dec));
      console.log("contract : " + formatNumberFromBN(contractBalance, dec));

      await expect(Vesting.connect(owner).withdraw(getBNFromNumber(10000000, dec))).to.be.not.reverted;
      console.log(`Withdraw 10,000,000 tokens from vesting contract`);

      console.log("After Withdraw")
      ownerBalance = await token.balanceOf(owner.address);
      contractBalance = await token.balanceOf(Vesting.address);
      console.log("owner : " + formatNumberFromBN(ownerBalance, dec));
      console.log("contract : " + formatNumberFromBN(contractBalance, dec));
   });
})
