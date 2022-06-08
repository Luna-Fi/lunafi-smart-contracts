const { BigNumber } = require("ethers");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}

const rewardsPerSecond = ethers.BigNumber.from('86805555555555600')//ethers.utils.BigNumber.from('86805555555555600');

module.exports = [
    "VLFI",
    "vLFI",
    "0xCa7BF3C514d412AC12D10Eff302301A81153F557",
    864000,
    172800,
    rewardsPerSecond
];
