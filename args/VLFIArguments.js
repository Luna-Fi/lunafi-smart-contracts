const { BigNumber} = require("ethers");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}

const rewardsPerSecond = ethers.utils.formatUnits(returnBigNumber(1 * 10 **18),0);
module.exports = [
    "VLFI",
    "VLFI",
    "",
    120,
    60,
    rewardsPerSecond,
    3000
];