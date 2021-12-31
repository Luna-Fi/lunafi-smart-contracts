const { expect } = require("chai");

describe("Signature Tests", async function () {
    it('should get,set EV using controlled access & whitelisted data', async function () {
        const USDCHP = await ethers.getContractFactory('HousePoolUSDC');
        const accounts = await ethers.getSigners();
        const owner = accounts[0];
        const user = accounts[1];
        const operator = accounts[2];
        const attacker = accounts[3];
        const _null = ethers.constants.AddressZero;
        const contract = await USDCHP.deploy(owner.address, _null, _null);
        await contract.deployed();


        const initialEV = await contract.getEV();
        console.log(`Initial EV value is: ${ethers.utils.formatEther(initialEV, { pad: true })}`);

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
            EVData: [
                { name: "signer", type: "address" },
                { name: "evValue", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256"}
            ],
        };
        const _eip712Value = {
            signer: owner.address,
            evValue: _evValue,
            nonce: 0,
            deadline: _deadline
        };
        const _data = [_eip712Domain, _eip712Types, _eip712Value];

        const _ownerSignature = await owner._signTypedData(..._data);
        // const _attackerSignature = await _getSignature(attacker, ..._data);

        await contract.setEVFromSignedData(_ownerSignature, owner.address, _evValue, _deadline, { gasLimit: 10000000 });
        const updatedEV = await contract.getEV();
        expect(updatedEV).to.not.equal(initialEV);
        expect(updatedEV).to.equal(_evValue);
    })
});