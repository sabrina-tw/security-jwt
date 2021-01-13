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

  describe("POST /login", () => {
    it("should log user in if password is correct", async () => {
      const trainer = {
        username: "trainer1",
        password: "password1",
      };

      const response = await request(app)
        .post("/trainers/login")
        .send(trainer)
        .expect(200);

      expect(response.text).toEqual("You are now logged in!");
    });

    it("should return error if password is incorrect", async () => {
      const trainer = {
        username: "trainer1",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/trainers/login")
        .send(trainer)
        .expect(400);

      expect(response.text).toContain("Login failed");
    });
  });
});
