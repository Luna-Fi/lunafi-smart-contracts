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

        await contract.connect(owner).grantRole(contract.HOUSE_POOL_DATA_PROVIDER(), dataProvider.address);
        await contract.connect(owner).grantRole(contract.HOUSE_POOL_OPERATOR(), operator.address);

        const initialEV = await contract.getEV();
        console.log(`Initial EV value is: ${ethers.utils.formatEther(initialEV)}`);

        // Random value to set as EV -- random value between 1 to 1000 ether
        const _evValue = ethers.utils.parseUnits((Math.random() * 1000).toString(), 18);
        console.log(`Attempting update EV value to: ${ethers.utils.formatEther(_evValue, { pad: true })}`);

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
                { name: "value", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" }
            ],
        };
        const _eip712Value = {
            signer: dataProvider.address,
            value: _evValue,
            nonce: 0,
            deadline: _deadline
        };
        const _data = [_eip712Domain, _eip712Types, _eip712Value];

        const _signature = await dataProvider._signTypedData(..._data);
        // const _attackerSignature = await _getSignature(attacker, ..._data);

        await contract.connect(operator).setEVFromSignedData(
            _signature,
            {
                value: _evValue,
                deadline: _deadline,
                signer: dataProvider.address
            });
        const updatedEV = await contract.getEV();
        expect(updatedEV).to.not.equal(initialEV);
        expect(updatedEV).to.equal(_evValue);
    })
});