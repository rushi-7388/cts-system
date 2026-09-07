const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { signToken } = require("../utils/jwt.util");

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { bank: true },
  });

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken({
    id: user.id,
    role: user.role,
    bankId: user.bankId,
    email: user.email,
  });

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      bank: { id: user.bank.id, name: user.bank.name, ifsc: user.bank.ifsc, code: user.bank.code },
    },
  });
}

async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { bank: true },
  });
  if (!user) return res.status(404).json({ error: "User not found" });

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    bank: { id: user.bank.id, name: user.bank.name, ifsc: user.bank.ifsc, code: user.bank.code },
  });
}

module.exports = { login, me };
