const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

async function mineBlocks(blockNumber) {
    while (blockNumber > 0) {
        blockNumber--;
        await hre.network.provider.request({
            method: "evm_mine",
            params: [],
        });
    }
}

describe("Farming Tests", async function () {
    let owner, investor;
    let ct, mt, lfi, farm, contract;
    const _name = "";
    const _version = "";
    const _rewardPerSecond = ethers.utils.parseUnits((Math.random() * 1000).toString(), 18);

    let _newFarmID;
    const _newFarmAllocPoints = 1;
    const _usdcInvestment = 100 * 10 ** 6;

    before(async function () {
        const USDCHP = await ethers.getContractFactory('HousePoolUSDC');
        const CT = await ethers.getContractFactory('USDCclaimToken');
        const MT = await ethers.getContractFactory('mockUSDCToken');
        const LFI = await ethers.getContractFactory('LFIToken');
        const FARM = await ethers.getContractFactory('LFiFarms');
        const accounts = await ethers.getSigners();
        owner = accounts[0];
        investor = accounts[1];
        ct = await CT.deploy();
        await ct.deployed();
        mt = await MT.deploy()
        await mt.deployed();
        lfi = await LFI.deploy();
        await lfi.deployed();
        farm = await FARM.deploy(owner.address, lfi.address);
        await farm.deployed();

        contract = await USDCHP.deploy(owner.address, mt.address, ct.address, _name, _version);
        await contract.deployed();

        await ct.connect(owner).addAdmin(contract.address);
        await mt.connect(owner).transfer(investor.address, _usdcInvestment);

        await farm.connect(owner).setRewardPerSecond(_rewardPerSecond);
        console.log({ RewardPerSecond: `${ethers.utils.formatUnits(_rewardPerSecond, 18)}` });
        await farm.connect(owner).createFarm(_newFarmAllocPoints, ct.address);
        _newFarmID = BigNumber.from(await farm.getFarmCount()) - 1;
    });

    it('should allow investor to harvest LFI tokens', async function () {
        await expect(farm.checkFarmDoesntExist(ct.address))
            .to.be.revertedWith('Farm exists already');

        await mt.connect(investor).approve(contract.address, _usdcInvestment);
        await contract.connect(investor).deposit_(_usdcInvestment);
        const investorLPBalance = await ct.balanceOf(investor.address);

        await ct.connect(investor).approve(farm.address, investorLPBalance);
        await expect(farm.connect(investor).deposit(_newFarmID, investorLPBalance, investor.address))
            .to.emit(farm, 'FarmDeposit')
        // .withArgs();

        console.log({ AtBlock: await ethers.provider.getBlockNumber() });
        await mineBlocks(4);
        console.log({ AtBlock: await ethers.provider.getBlockNumber() });

        await expect(farm.connect(investor).withdraw(_newFarmID, investorLPBalance, investor.address))
            .to.emit(farm, 'FarmWithdraw')
        // .withArgs();

        await expect(farm.connect(investor).harvestAll(investor.address))
            .to.emit(farm, 'FarmHarvest')

        await console.log(lfi.connect(investor).balanceOf(investor.address));
    })
});
