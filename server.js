const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const axios = require("axios");
const dotenv = require("dotenv");
const path=require("path");

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

// GitHub Login Route
app.get("/auth/github", (req, res) => {
  const redirect_uri = "http://localhost:3000/auth/github/callback";
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect_uri}&scope=repo`
  );
});


app.get("/auth/github/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect("/");

  try {
    
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenResponse.data.access_token;

   
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = { id: userResponse.data.id, username: userResponse.data.login };

  
    const token = jwt.sign({ ...user, accessToken }, JWT_SECRET, { expiresIn: "1h" });


    res.cookie("token", token, { httpOnly: true, secure: false });

    res.redirect("/");
  } catch (error) {
    console.error("GitHub Authentication Error:", error.message);
    res.redirect("/");
  }
});


const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.redirect("/auth/github");

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.redirect("/auth/github");
    req.user = user;
    next();
  });
};

// Home Page
app.get("/", verifyToken, (req, res) => {
  res.render("home", { user: req.user });
});



// Fetch GitHub Repositories
app.get("/repos", verifyToken, async (req, res) => {
  try {
    const { accessToken } = req.user;

    const repoResponse = await axios.get("https://api.github.com/user/repos", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    res.render("repos", { repos: repoResponse.data, user: req.user });
  } catch (error) {
    console.error("Error fetching repositories:", error.message);
    res.redirect("/");
  }
});

// Logout
app.get("/logout", (req, res) => {
    res.clearCookie("token"); // Clear the JWT stored in cookies
    res.redirect("/");
  });

app.listen(3000, () => console.log("Server running on http://localhost:3000"));

app.get("/repooperation/:repoName", (req, res) => {
    const repoName = req.params.repoName;
    res.render("repooperation", { repoName });
});


app.get("/securityscan/:repo",verifyToken, async (req, res) => {
    const owner=req.user.username;
    const repo=req.params.repoName;
    const githubToken = process.env.GITHUB_ACCESS_TOKEN;

    console.log("🔹 Received security scan request");
    console.log("🔹 GitHub Repository:", `${owner}/${repo}`);

    try {
        // Step 1: Check if security scanning is enabled
        console.log("🔹 Checking Dependabot security alerts...");
        const securityResponse = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/vulnerability-alerts`,
            {
                headers: {
                    Authorization: `Bearer ${githubToken}`,
                    Accept: "application/vnd.github+json"
                }
            }
        );

        if (securityResponse.status !== 204) {
            console.warn("⚠️ Security scanning may be disabled!");
            return res.render("securityscan", {
                repoName: repo,
                alerts: [],
                error: "⚠️ Security scanning is disabled. Enable it in GitHub settings."
            });
        }

        console.log("✅ Security scanning is enabled!");

        // Step 2: Fetch security advisories
        console.log("🔹 Fetching security advisories...");
        const advisoryResponse = await axios.get(
            "https://api.github.com/advisories",
            {
                params: { q: repo }, // Search advisories by repository name
                headers: {
                    Authorization: `Bearer ${githubToken}`,
                    Accept: "application/vnd.github+json"
                }
            }
        );

        console.log("✅ GitHub Advisory API Response Received");
        console.log("🔹 Response Data:", advisoryResponse.data);

        const alerts = advisoryResponse.data || [];

        if (alerts.length === 0) {
            console.log("✅ No known security threats found.");
        } else {
            console.log(`⚠️ Found ${alerts.length} security advisories!`);
        }

        res.render("securityscan", { repoName: repo, alerts, error: null });

    } catch (error) {
        console.error("❌ Error fetching security alerts:", error.response?.data || error.message);

        res.render("securityscan", {
            repoName: repo,
            alerts: [],
            error: "❌ Failed to fetch security threats. Check API token and repository permissions."
        });
    }
});