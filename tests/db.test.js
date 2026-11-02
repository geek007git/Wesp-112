const { test } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

test("database connection rejects missing configuration, retries failures, and shares connections", async (t) => {
  const previousUrl = process.env.MONGO_URL;
  delete require.cache[require.resolve("../config/db")];
  const connectDB = require("../config/db");
  let attempts = 0;
  const connect = t.mock.method(mongoose, "connect", async () => {
    attempts += 1;
    if (attempts === 1) throw new Error("Connection refused");
    return mongoose;
  });
  try {
    delete process.env.MONGO_URL;
    await assert.rejects(connectDB(), /MONGO_URL is required/);
    assert.equal(attempts, 0);
    process.env.MONGO_URL = "mongodb://127.0.0.1:27017/test";
    await assert.rejects(connectDB(), /Connection refused/);
    const connections = await Promise.all([connectDB(), connectDB()]);
    assert.equal(attempts, 2);
    assert.equal(connections[0], mongoose);
    assert.equal(connections[1], mongoose);
    assert.equal(connect.mock.calls[1].arguments[1].serverSelectionTimeoutMS, 10000);
  } finally {
    if (previousUrl === undefined) delete process.env.MONGO_URL;
    else process.env.MONGO_URL = previousUrl;
  }
});
