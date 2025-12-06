/**
 * Integration tests for SpendSmart backend API
 * 
 * AI-GENERATED (GPT-5.1 Thinking), 2025-12-02
 * Prompt:
 * "Create comprehensive integration tests for the SpendSmart backend API,
 *  covering transaction and goal management endpoints. Include tests for:
 *  - Creating and listing transactions with optional descriptions
 *  - Filtering transactions by date range
 *  - Handling invalid transaction data
 *  - Managing goals and active goal filtering"
 * 
 * Edits by Abhishek:
 * - Updated test cases to match actual API behavior
 * - Added specific test for description field handling
 * - Ensured proper cleanup between tests
 */

import request from "supertest";
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from "../app.js";

let mongoServer;

// Setup in-memory MongoDB for testing
beforeAll(async () => {
  // Use in-memory MongoDB for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Set the MongoDB URI for the test environment
  process.env.MONGO_URI = mongoUri;
  
  // Clear any existing connections
  await mongoose.disconnect();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
  
  // Clear any existing data
  app.locals.tx = [];
  app.locals.goals = [];
});

// Clear all test data after each test
afterEach(async () => {
  // Clear in-memory storage
  app.locals.tx = [];
  app.locals.goals = [];
});

// Close the database connection after all tests are done
afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Transaction API Integration Tests', () => {
    test('should create and list transactions with description', async () => {
    const newTransaction = {
        date: new Date().toISOString().split('T')[0],
        amount: 100.50,
        category: 'groceries',
        description: 'Weekly grocery shopping'
    };

    const createResponse = await request(app)
        .post('/api/transactions')
        .send(newTransaction);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
        amount: 100.5,
        category: 'groceries',
        description: 'Weekly grocery shopping',
        source: 'manual',
    });
    expect(createResponse.body.id).toBeDefined();
    
    const listResponse = await request(app).get('/api/transactions');
    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.length).toBe(1);
    expect(listResponse.body[0].id).toBe(createResponse.body.id);
    });


  test('should create transaction without description', async () => {
    const newTransaction = {
        date: new Date().toISOString().split('T')[0],
        amount: 200.00,
        category: 'utilities'
    };

    const createResponse = await request(app)
        .post('/api/transactions')
        .send(newTransaction);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
        amount: 200,
        category: 'utilities',
        source: 'manual',
    });
    expect(createResponse.body.description).toBeUndefined();
  });

  test('should filter transactions by date range', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const transactions = [
        {
        date: today.toISOString().split('T')[0],
        amount: 50,
        category: 'food'
        },
        {
        date: yesterday.toISOString().split('T')[0],
        amount: 100,
        category: 'transportation'
        }
    ];

    for (const tx of transactions) {
        await request(app).post('/api/transactions').send(tx);
    }

    const todayResponse = await request(app)
        .get('/api/transactions')
        .query({
        from: today.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0]
        });

    expect(todayResponse.status).toBe(200);
    expect(todayResponse.body.length).toBe(1);
    expect(todayResponse.body[0].category).toBe('food');
    });

  test('should handle transaction creation with invalid data', async () => {
    // Missing required 'date' field
    const invalidTransaction = {
      amount: 50,
      category: 'entertainment'
    };

    const response = await request(app)
      .post('/api/transactions')
      .send(invalidTransaction);

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});

describe('Goal API Integration Tests', () => {
  test('should create and list goals', async () => {
    // 1. Create a new goal
    const newGoal = {
      category: 'groceries',
      targetAmount: 500,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      period: 'monthly'
    };

    // 2. Test creating a goal
    const createResponse = await request(app)
      .post('/api/goals')
      .send(newGoal);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      category: 'groceries',
      targetAmount: 500,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      period: 'monthly'
    });
    expect(createResponse.body.id).toBeDefined();

    // 3. Test listing all goals
    const listResponse = await request(app).get('/api/goals');
    
    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.length).toBe(1);
    expect(listResponse.body[0].category).toBe('groceries');
  });

  test('should only return active goals', async () => {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setFullYear(now.getFullYear() + 1);
    
    const goals = [
      {
        category: 'active',
        targetAmount: 1000,
        startDate: now.toISOString().split('T')[0],
        endDate: futureDate.toISOString().split('T')[0],
        period: 'monthly'
      },
      {
        category: 'inactive',
        targetAmount: 2000,
        startDate: '2020-01-01',
        endDate: '2020-12-31',
        period: 'yearly'
      }
    ];

    // Add test goals
    for (const goal of goals) {
      await request(app).post('/api/goals').send(goal);
    }

    // Only the active goal should be returned
    const response = await request(app).get('/api/goals');
    
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].category).toBe('active');
  });
});
