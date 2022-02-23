const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}


describe("USDC HousePool", () => {

    let MOCKUSDC
    let USDCCLAIMTOKEN
    let USDCHOUSEPOOL
    let usdcHousePool
    let usdcClaimToken
    let mockUSDC

    let tokenAmount = 100000 * 10 ** 6
    before(async () => {

        const approvalAmount = 1000000 * 10 ** 8
        const [owner, user1, operator] = await ethers.getSigners()

        MOCKUSDC = await ethers.getContractFactory("mockUSDCToken")
        mockUSDC = await MOCKUSDC.deploy()
        await mockUSDC.deployed()
        console.log(" Mock USDC Token Address  : ", mockUSDC.address)

        USDCCLAIMTOKEN = await ethers.getContractFactory("USDCclaimToken")
        usdcClaimToken = await USDCCLAIMTOKEN.deploy()
        await usdcClaimToken.deployed()
        console.log(" USDC Claim Token Address : ", usdcClaimToken.address)

        USDCHOUSEPOOL = await ethers.getContractFactory("HousePoolUSDC")
        // usdcHousePool = await USDCHOUSEPOOL.deploy(owner.address,mockUSDC.address,usdcClaimToken.address, "","")
        usdcHousePool = await upgrades.deployProxy(USDCHOUSEPOOL, [owner.address, mockUSDC.address, usdcClaimToken.address, "", ""], { initializer: 'initialize' });

        await usdcHousePool.deployed()
        console.log(" USDC House Pool  Address  : ", usdcHousePool.address)

        await mockUSDC.approve(usdcHousePool.address, approvalAmount)
        await usdcClaimToken.approve(usdcHousePool.address, approvalAmount)
        await usdcClaimToken.addAdmin(usdcHousePool.address)

        await mockUSDC.connect(user1).approve(usdcHousePool.address, approvalAmount)
        await usdcClaimToken.connect(user1).approve(usdcHousePool.address, approvalAmount)
        await mockUSDC.transfer(user1.address, tokenAmount)

        await mockUSDC.connect(operator).approve(usdcHousePool.address, approvalAmount)
        await mockUSDC.transfer(operator.address, tokenAmount)
    })

    it(`USDC HOUSE POOL setVOI signed data test`, async () => {
        const [owner, dataProvider, operator] = await ethers.getSigners()

        await usdcHousePool.connect(owner).grantRole(usdcHousePool.DATA_PROVIDER_ORACLE(), dataProvider.address);
        await usdcHousePool.connect(owner).grantRole(usdcHousePool.HOUSE_POOL_DATA_PROVIDER(), operator.address);

        const initialEV = await usdcHousePool.getEV();
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
            name: "",
            version: "",
            chainId: _chain.chainId,
            verifyingContract: usdcHousePool.address,
        };
        const _eip712Types = {
            VoI: [
                { name: "signer", type: "address" },
                { name: "expectedValue", type: "int256" },
                { name: "maxExposure", type: "uint256" },
                { name: 'nonce', type: 'uint256' },
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

        await usdcHousePool.connect(operator).setVOI(
            _signature,
            {
                expectedValue: _evValue,
                maxExposure: _meValue,
                deadline: _deadline,
                nonce: 0,
                signer: dataProvider.address
            });
        const updatedEV = await usdcHousePool.getEV();
        expect(ethers.utils.formatEther(updatedEV)).to.not.equal(ethers.utils.formatEther(initialEV));
        expect(ethers.utils.formatEther(updatedEV)).to.equal(ethers.utils.formatEther(_evValue));
    })

    it(`USDC HOUSE POOL deposit signed data test`, async () => {
        const [owner, dataProvider, operator] = await ethers.getSigners()

        await usdcHousePool.connect(owner).grantRole(usdcHousePool.DATA_PROVIDER_ORACLE(), dataProvider.address);
        await usdcHousePool.connect(owner).grantRole(usdcHousePool.HOUSE_POOL_DATA_PROVIDER(), operator.address);

        const initialEV = await usdcHousePool.getEV();
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
            name: "",
            version: "",
            chainId: _chain.chainId,
            verifyingContract: usdcHousePool.address,
        };
        const _eip712Types = {
            VoI: [
                { name: "signer", type: "address" },
                { name: "expectedValue", type: "int256" },
                { name: "maxExposure", type: "uint256" },
                { name: 'nonce', type: 'uint256' },
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

        await usdcHousePool.connect(operator).deposit(
            tokenAmount,
            _signature,
            {
                expectedValue: _evValue,
                maxExposure: _meValue,
                deadline: _deadline,
                nonce: 0,
                signer: dataProvider.address
            });
        const operatorTokenBalance = await mockUSDC.balanceOf(operator.address)
        expect(ethers.utils.formatEther(operatorTokenBalance)).to.equal(ethers.utils.formatEther(0))
    })

    it(`USDC HOUSE POOL withdraw signed data test`, async () => {
        const [owner, dataProvider, operator] = await ethers.getSigners()

        await usdcHousePool.connect(owner).grantRole(usdcHousePool.DATA_PROVIDER_ORACLE(), dataProvider.address);
        await usdcHousePool.connect(owner).grantRole(usdcHousePool.HOUSE_POOL_DATA_PROVIDER(), operator.address);


        const initialEV = await usdcHousePool.getEV();
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
            name: "",
            version: "",
            chainId: _chain.chainId,
            verifyingContract: usdcHousePool.address,
        };
        const _eip712Types = {
            VoI: [
                { name: "signer", type: "address" },
                { name: "expectedValue", type: "int256" },
                { name: "maxExposure", type: "uint256" },
                { name: 'nonce', type: 'uint256' },
                { name: "deadline", type: "uint256" }
            ],
        };
        const _eip712Value = {
            signer: dataProvider.address,
            expectedValue: 0,
            maxExposure: 0,
            nonce: 0,
            deadline: _deadline
        };
        const _data = [_eip712Domain, _eip712Types, _eip712Value];

        const _signature = await dataProvider._signTypedData(..._data);

        await usdcHousePool.connect(operator).withdraw(
            tokenAmount,
            _signature,
            {
                expectedValue: 0,
                maxExposure: 0,
                deadline: _deadline,
                nonce: 0,
                signer: dataProvider.address
            });
        const operatorTokenBalance = await mockUSDC.balanceOf(operator.address)
        expect(ethers.utils.formatEther(operatorTokenBalance)).to.equal(ethers.utils.formatEther(tokenAmount))
    })
})


