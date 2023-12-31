import { expect } from "chai";
import { Contract, Wallet } from "ethers";
import { run } from "hardhat";

import { deployTestContracts } from "../e2e/fixture";

let manager: Wallet;
let solver: Wallet;
let notSolver: Wallet;
let notManager: Wallet;

let authenticator: Contract;

describe("Task: solvers", () => {
  beforeEach(async () => {
    const deployment = await deployTestContracts();

    ({
      manager,
      authenticator,
      wallets: [solver, notSolver, notManager],
    } = deployment);

    await authenticator.connect(manager).addSolver(solver.address);
  });

  describe("check", () => {
    let output: unknown = undefined;
    let consoleLog: typeof console.log;

    beforeEach(() => {
      consoleLog = console.log;
      console.log = (...args: unknown[]) => (output = args[0]);
    });
    afterEach(() => {
      console.log = consoleLog;
      output = undefined;
    });

    it("valid solver", async () => {
      await run("solvers", {
        subtask: "check",
        address: solver.address,
      });
      expect(output).to.equal(`${solver.address} is a solver.`);
    });

    it("invalid solver", async () => {
      await run("solvers", {
        subtask: "check",
        address: notSolver.address,
      });
      expect(output).to.equal(`${notSolver.address} is NOT a solver.`);
    });
  });

  describe("add", () => {
    it("adds a solver", async () => {
      expect(await authenticator.isSolver(notSolver.address)).to.be.false;
      await run("solvers", {
        subtask: "add",
        address: notSolver.address,
      });
      expect(await authenticator.isSolver(notSolver.address)).to.be.true;
    });

    it("does not add a solver when --print-transaction is specified", async () => {
      expect(await authenticator.isSolver(notSolver.address)).to.be.false;
      await run("solvers", {
        subtask: "add",
        address: notSolver.address,
        printTransaction: true,
      });
      expect(await authenticator.isSolver(notSolver.address)).to.be.false;
    });
  });

  describe("remove", () => {
    it("removes a solver", async () => {
      expect(await authenticator.isSolver(solver.address)).to.be.true;
      await run("solvers", {
        subtask: "remove",
        address: solver.address,
      });
      expect(await authenticator.isSolver(solver.address)).to.be.false;
    });

    it("does not remove a solver when --print-transaction is specified", async () => {
      expect(await authenticator.isSolver(solver.address)).to.be.true;
      await run("solvers", {
        subtask: "remove",
        address: solver.address,
        printTransaction: true,
      });
      expect(await authenticator.isSolver(solver.address)).to.be.true;
    });
  });

  describe("setManager", () => {
    it("sets the manager", async () => {
      expect(await authenticator.manager()).not.to.equal(notManager.address);
      await run("solvers", {
        subtask: "setManager",
        address: notManager.address,
      });
      expect(await authenticator.manager()).to.equal(notManager.address);
    });

    it("does not set the manager when --print-transaction is specified", async () => {
      expect(await authenticator.manager()).not.to.equal(notManager.address);
      await run("solvers", {
        subtask: "setManager",
        address: notManager.address,
        printTransaction: true,
      });
      expect(await authenticator.manager()).not.to.equal(notManager.address);
    });
  });
});
