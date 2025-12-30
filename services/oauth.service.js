function handleGithubUser(user) {
  return {
    id: user.id,
    username: user.username,
    provider: "github"
  };
}

module.exports = { handleGithubUser };
