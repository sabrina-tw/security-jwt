const request = require("supertest");
const app = require("../src/app");
const dbHandler = require("../test/dbHandler");
const Trainer = require("../src/models/trainer.model");

jest.mock("jsonwebtoken");

const trainers = [
  {
    username: "trainer1",
    password: "password1",
    firstName: "Jane",
    lastName: "Doe",
  },
  {
    username: "trainer2",
    password: "password2",
  },
];

describe("trainers", () => {
  beforeAll(async () => await dbHandler.connect());
  afterEach(async () => await dbHandler.clearDatabase());
  afterAll(async () => await dbHandler.closeDatabase());

  beforeEach(async () => {
    await Trainer.create(trainers);
  });

  describe("POST /", () => {
    it("should add a new trainer", async () => {
      const newTrainer = {
        username: "newtrainer",
        password: "password3",
      };

      const { body: trainer } = await request(app)
        .post("/trainers")
        .send(newTrainer);

      expect(trainer.username).toBe(newTrainer.username);
      expect(trainer.password).not.toBe(newTrainer.password);
    });
  });
});
