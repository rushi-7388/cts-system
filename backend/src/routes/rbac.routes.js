const express = require("express");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  getRolesAndMatrix,
  getBranches,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/rbac.controller");

const router = express.Router();

// All RBAC endpoints require authentication
router.use(authenticate);

// Public to authenticated users: inspection of RBAC policy & available branches
router.get("/matrix", getRolesAndMatrix);
router.get("/branches", getBranches);

// Provisioning and user management: strictly for BRANCH_MANAGER and ADMIN
router.get("/users", authorize("BRANCH_MANAGER", "ADMIN"), getUsers);
router.post("/users", authorize("BRANCH_MANAGER", "ADMIN"), createUser);
router.patch("/users/:id", authorize("BRANCH_MANAGER", "ADMIN"), updateUser);
router.delete("/users/:id", authorize("BRANCH_MANAGER", "ADMIN"), deleteUser);

module.exports = router;
