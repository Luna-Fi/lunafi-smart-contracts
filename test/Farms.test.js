const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

describe("Farming Tests", async function () {
    let owner, investor;
    let ct, mt, lfi, contract;
    const _name = "LunaFi";
    const _version = "1.0.0";
    const _rewardPerSecond = ethers.utils.parseUnits((Math.random() * 1000).toString(), 18);

    let _newFarmID;
    const _newFarmAllocPoints = 1;
    const _usdcInvestment = 100 * 10**6;

    before(async function () {
        const USDCHP = await ethers.getContractFactory('HousePoolUSDC');
        const CT = await ethers.getContractFactory('USDCclaimToken');
        const MT = await ethers.getContractFactory('mockUSDCToken');
        const LFI = await ethers.getContractFactory('LFIToken');
        const accounts = await ethers.getSigners();
        owner = accounts[0];
        investor = accounts[1];
        ct = await CT.deploy();
        await ct.deployed();
        mt = await MT.deploy()
        await mt.deployed();
        lfi = await LFI.deploy();
        await lfi.deployed();

        contract = await USDCHP.deploy(owner.address, mt.address, ct.address, lfi.address, _name, _version);
        await contract.deployed();

        await ct.connect(owner).addAdmin(contract.address);
        await mt.connect(owner).transfer(investor.address, _usdcInvestment);

        await contract.connect(owner).setRewardPerSecond(_rewardPerSecond);
        await contract.connect(owner).createFarm(_newFarmAllocPoints, ct.address);
        _newFarmID = BigNumber.from(await contract.getFarmCount()) - 1;
    });

    it('should allow investor to harvest LFI tokens', async function () {
        await expect(contract.checkFarmDoesntExist(ct.address))
            .to.be.revertedWith('Farm exists already');

        await mt.connect(investor).approve(contract.address, _usdcInvestment);
        await contract.connect(investor).deposit_(_usdcInvestment);
        const investorLPBalance = await ct.balanceOf(investor.address);

        await ct.connect(investor).approve(contract.address, investorLPBalance);
        await contract.connect(investor).depositLP(_newFarmID, investorLPBalance, investor.address);
    })
});
 