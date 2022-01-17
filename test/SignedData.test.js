const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Signature Tests", async function () {
    it('should get,set EV using controlled access & whitelisted data', async function () {
        const USDCHP = await ethers.getContractFactory('HousePoolUSDC');
        const CT = await ethers.getContractFactory('USDCclaimToken');
        const MT = await ethers.getContractFactory('mockUSDCToken');
        const accounts = await ethers.getSigners();
        const owner = accounts[0];
        const dataProvider = accounts[1];
        const operator = accounts[2];
        const attacker = accounts[3];
        const ct = await CT.deploy();
        await ct.deployed();
        const mt = await MT.deploy()
        await mt.deployed();
        const name = "LunaFi";
        const version = "1.0.0";

        const contract = await USDCHP.deploy(owner.address, mt.address, ct.address, name, version);
        await contract.deployed();

        await contract.connect(owner).grantRole(contract.DATA_PROVIDER_ORACLE(), dataProvider.address);
        await contract.connect(owner).grantRole(contract.HOUSE_POOL_DATA_PROVIDER(), operator.address);

        const initialEV = await contract.getEV();
        console.log(`Initial EV value is: ${ethers.utils.formatEther(initialEV)}`);

        // Random value to set as EV -- random value between -500 to 500 ether
        const _evValue = ethers.utils.parseUnits(((Math.random() * 1000) - 500).toString(), 18);
        console.log(`Attempting update EV value to: ${ethers.utils.formatEther(_evValue, { pad: true })}`);
        // Random value to set as ME -- random value between 0 to 100 ether
        const _meValue = ethers.utils.parseUnits((Math.random() * 100).toString(), 18);
        console.log(`Attempting update ME value to: ${ethers.utils.formatEther(_meValue, { pad: true })}`);

        // Prepare deadline
        const _expiration = 4; // number of blocks
        const _initialHeight = await ethers.provider.getBlockNumber();
        console.log("Now at block number: ", _initialHeight);
        const _deadline = _initialHeight + _expiration;
        console.log("Deadline blocknumber: ", _deadline);

        // Prepare data
        const _chain = await ethers.provider.getNetwork();
        const _eip712Domain = {
            name: "LunaFi",
            version: "1.0.0",
            chainId: _chain.chainId,
            verifyingContract: contract.address,
        };
        const _eip712Types = {
            VoI: [
                { name: "signer", type: "address" },
                { name: "expectedValue", type: "int256" },
                { name: "maxExposure", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" }
            ],
        };
        const _eip712Value = {
            signer: dataProvider.address,
            expectedValue: _evValue,
            maxExposure: _meValue,
            nonce: 0,
            deadline: _deadline
        };
        const _data = [_eip712Domain, _eip712Types, _eip712Value];

        const _signature = await dataProvider._signTypedData(..._data);

        await contract.connect(operator).setVOI(
            _signature,
            {
                expectedValue: _evValue,
                maxExposure: _meValue,
                deadline: _deadline,
                signer: dataProvider.address
            });
        const updatedEV = await contract.getEV();
        expect(updatedEV).to.not.equal(initialEV);
        expect(updatedEV).to.equal(_evValue);
    })
});