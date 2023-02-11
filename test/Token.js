const { ethers } = require('hardhat');
const { expect } = require('chai');
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 18);
};
describe('Token', () => {
  let token, accounts, deployer, receiver, decentralizedExchange;

  beforeEach(async () => {
    const Token = await ethers.getContractFactory('Token');
    token = await Token.deploy('My Token', 'MT', 1000000);
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    receiver = accounts[1];
    decentralizedExchange = accounts[2];
  });

  describe('Deployment', async () => {
    const name = 'My Token';
    const symbol = 'MT';
    const decimals = 18;
    const totalSupply = tokens(1000000);
    it('Returns the correct token name', async () => {
      expect(await token.name()).to.equal(name);
    });

    it('Returns the correct symbol of the token', async () => {
      expect(await token.symbol()).to.equal(symbol);
    });

    it('Returns the correct decimals', async () => {
      expect(await token.decimals()).to.equal(decimals);
    });

    it('Returns the total supply', async () => {
      expect(await token.totalSupply()).to.equal(totalSupply);
    });

    it('Assigns total supply to the deployer', async () => {
      expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
    });
  });
  describe('Sending tokens', async () => {
    let amount, transaction, receipt;

    describe('Successful Transfers', () => {
      beforeEach(async () => {
        amount = tokens(100);
        transaction = await token
          .connect(deployer)
          .transfer(receiver.address, amount);
        receipt = await transaction.wait();
      });

      it('Transfers tokens', async () => {
        expect(await token.balanceOf(deployer.address)).to.equal(
          tokens(999900)
        );
        expect(await token.balanceOf(receiver.address)).to.equal(amount);
      });

      it('Emit a transfer event', async () => {
        const event = receipt.events[0];
        expect(await event.event).to.equal('Transfer');

        const args = event.args;
        expect(args._from).to.equal(deployer.address);
        expect(args._to).to.equal(receiver.address);
        expect(args._value).to.equal(amount);
      });
    });
    describe('Failing Transfers', () => {
      it('Rejects if sender does not have enough funds', async () => {
        const invalidAmount = tokens(10);
        await expect(
          token.connect(receiver).transfer(deployer.address, invalidAmount)
        ).to.be.revertedWith('Insufficient Funds');
      });

      it('Rejects if the receiver is zero address', async () => {
        const amount = tokens(10);
        await expect(
          token
            .connect(deployer)
            .transfer('0x0000000000000000000000000000000000000000', amount)
        ).to.be.revertedWith('Transfer to zero account is not permitted');
      });
    });
  });

  describe('Sending tokens', async () => {
    let amount, transaction, receipt;
    beforeEach(async () => {
      amount = tokens(100);
      transaction = await token
        .connect(deployer)
        .approve(decentralizedExchange.address, amount);
      receipt = await transaction.wait();
    });

    describe('Successful Approvals', () => {
      it('Allocates an allowance for delegated token spending', async () => {
        expect(
          await token.allowance(deployer.address, decentralizedExchange.address)
        ).to.equal(amount);
      });

      it('Emit an approval event', async () => {
        const event = receipt.events[0];
        expect(await event.event).to.equal('Approval');

        const args = event.args;
        expect(args._owner).to.equal(deployer.address);
        expect(args._spender).to.equal(decentralizedExchange.address);
        expect(args._value).to.equal(amount);
      });
    });
    describe('Failing Transfers', () => {
      it('Rejects approval if spender is the zero address', async () => {
        await expect(
          token
            .connect(deployer)
            .approve('0x0000000000000000000000000000000000000000', amount)
        ).to.be.revertedWith('Approval of zero address is not permitted');
      });
    });
  });
});

// console.log('Transaction Receipt');
// console.log(receipt);

// console.log('Event arguments');
// console.log(args);
