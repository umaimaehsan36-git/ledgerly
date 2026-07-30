require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Goal = require('./models/Goal');
const requireAuth = require('./middleware/requireAuth');

const calculateRisk = require('./utils/riskEngine');
const Account = require('./models/Account');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ---------- AUTH ----------
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Password strength check
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!strongPassword.test(password)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, passwordHash });
    await newUser.save();

    const personalAccount = new Account({
      name: `${name}'s Personal Account`,
      members: [{ userId: newUser._id, role: 'owner' }]
    });
    await personalAccount.save();

    res.json({ message: "User created!", userId: newUser._id, accountId: personalAccount._id });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Find the user's accounts
    const accounts = await Account.find({ 'members.userId': user._id });
    const defaultAccount = accounts[0]; // for now, use the first one

    const token = jwt.sign(
      { id: user._id, accountId: defaultAccount?._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: "Login successful!", token, name: user.name, accountId: defaultAccount?._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ---------- ACCOUNTS ----------
app.post('/api/accounts/invite', requireAuth, async (req, res) => {
  try {
    const { email } = req.body;

    const invitedUser = await User.findOne({ email });
    if (!invitedUser) return res.status(404).json({ error: "No user found with that email" });

    const account = await Account.findById(req.accountId);
    if (!account) return res.status(404).json({ error: "Account not found" });

    // Only the owner can invite others
    const myMembership = account.members.find(m => m.userId.toString() === req.userId);
    if (!myMembership || myMembership.role !== 'owner') {
      return res.status(403).json({ error: "Only the account owner can invite members" });
    }

    const alreadyMember = account.members.some(m => m.userId.toString() === invitedUser._id.toString());
    if (alreadyMember) return res.status(400).json({ error: "This user is already a member" });

    account.members.push({ userId: invitedUser._id, role: 'member' });
    await account.save();

    res.json({ message: `${invitedUser.name} added to the account!` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/accounts/members', requireAuth, async (req, res) => {
  const account = await Account.findById(req.accountId).populate('members.userId', 'name email');
  if (!account) return res.status(404).json({ error: "Account not found" });
  res.json({ accountName: account.name, members: account.members });
});



// ---------- TRANSACTIONS ----------
app.get('/api/transactions', requireAuth, async (req, res) => {
  const transactions = await Transaction.find({ accountId: req.accountId }).sort({ date: -1 });
  res.json(transactions);
});

app.post('/api/transactions', requireAuth, async (req, res) => {
  try {
    const { amount, type, category, note } = req.body;
    if (amount <= 0) return res.status(400).json({ error: "Amount must be positive" });

    const { score, reasons } = await calculateRisk(Transaction, req.accountId, { amount, type, category });

    const newTransaction = new Transaction({
      accountId: req.accountId,
      addedBy: req.userId,
      amount, type, category, note,
      riskScore: score,
      flagged: score >= 40,
      flagReasons: reasons
    });
    await newTransaction.save();
    res.json(newTransaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/transactions/:id/review', requireAuth, async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, accountId: req.accountId });
  if (!transaction) return res.status(404).json({ error: "Not found" });
  transaction.reviewed = true;
  await transaction.save();
  res.json(transaction);
});

app.delete('/api/transactions/:id', requireAuth, async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, accountId: req.accountId });
  if (!transaction) return res.status(404).json({ error: "Not found" });
  await transaction.deleteOne();
  res.json({ message: "Deleted" });
});

// ---------- GOALS ----------
app.get('/api/goals', requireAuth, async (req, res) => {
  const goals = await Goal.find({ accountId: req.accountId });
  res.json(goals);
});

app.post('/api/goals', requireAuth, async (req, res) => {
  try {
    const { title, targetAmount, deadline } = req.body;
    const newGoal = new Goal({ accountId: req.accountId, title, targetAmount, deadline });
    await newGoal.save();
    res.json(newGoal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//------------------------------------
app.get('/api/dashboard/trends', requireAuth, async (req, res) => {
  const transactions = await Transaction.find({ accountId: req.accountId }).sort({ date: 1 });

  const monthly = {};
  transactions.forEach(t => {
    const key = new Date(t.date).toISOString().slice(0, 7);
    if (!monthly[key]) monthly[key] = { month: key, income: 0, expense: 0 };
    monthly[key][t.type] += t.amount;
  });
  const monthlyTrend = Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const thisMonthExpenses = transactions.filter(t =>
    t.type === 'expense' && new Date(t.date) >= startOfMonth
  );
  const spentSoFar = thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const dailyAverage = dayOfMonth > 0 ? spentSoFar / dayOfMonth : 0;
  const projectedTotal = Math.round(dailyAverage * daysInMonth);

  const recurring = [];
  const byCategory = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t.amount);
  });
  Object.entries(byCategory).forEach(([category, amounts]) => {
    if (amounts.length < 2) return;
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const similar = amounts.filter(a => Math.abs(a - avg) / avg < 0.1);
    if (similar.length >= 2) {
      recurring.push({ category, averageAmount: Math.round(avg), occurrences: similar.length });
    }
  });

  res.json({
    monthlyTrend,
    prediction: {
      spentSoFar,
      dailyAverage: Math.round(dailyAverage),
      projectedTotal,
      daysRemaining: daysInMonth - dayOfMonth
    },
    recurring
  });
});

// ---------- DASHBOARD ----------
app.get('/api/dashboard/summary', requireAuth, async (req, res) => {
  const transactions = await Transaction.find({ accountId: req.accountId });

  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  const byCategory = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });

  const goals = await Goal.find({ accountId: req.accountId });

  res.json({ balance, income, expense, spendingByCategory: byCategory, goals });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));