const { createClerkClient } = require("@clerk/backend");

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const createClerkUser = async (email, password, role) => {
  return clerk.users.createUser({
    email_address: email,
    password,
    public_metadata: { role },
  });
};

const deleteClerkUser = async (clerkUserId) => {
  return clerk.users.deleteUser(clerkUserId);
};

module.exports = { clerk, createClerkUser, deleteClerkUser };
