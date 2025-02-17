# DevSecOps Security Scanner

## Overview
This project is a **GitHub repository security scanner** that checks for vulnerabilities using  security API, including **GitHub Advisory Database, SonarCloud, and NVD API**. It allows users to scan repositories for known vulnerabilities in dependencies.

## Features
- **Scan GitHub repositories** for security vulnerabilities.
- Uses **GitHub Advisory API** to check for security alerts.
- Supports **SonarCloud API** for additional security analysis.
- Can fetch and analyze **dependencies** from repositories.
- Uses **NVD API** for general CVE lookups.
- **OAuth authentication** to verify users.

## Technologies Used
- **Node.js** (Backend)
- **Express.js** (Server framework)
- **EJS** (Frontend templating)
- **Axios** (For API requests)
- **GitHub OAuth** (For authentication)
- **GitHub Advisory API** (For vulnerability lookup)
- **SonarCloud API** (For additional scanning)
- **NVD API** (For CVE lookup)

---

## Setup & Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2️⃣ Install Dependencies
```bash
npm i express dotenv axios ejs cookie-parser jsonwebtoken passport passport-github

```

### 3️⃣ Set Up Environment Variables
Create a `.env` file in the project root and add the following:
```env
GITHUB_PAT=your_github_personal_access_token
SONARCLOUD_API_TOKEN=your_sonarcloud_api_token
NVD_API_KEY=your_nvd_api_key
SESSION_SECRET=your_session_secret
```

### 4️⃣ Run the Server
```bash
node server.js
```

---

## API Usage

### 🔹 **Scan a GitHub Repository**
```http
GET /securityscan/:repoName
```
**Parameters:**
- `repoName` (string) - The name of the GitHub repository to scan.

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_GITHUB_PAT" \
     -X GET "http://localhost:3000/securityscan/example-repo"
```

---

## Troubleshooting

### ❌ GitHub Advisory API Not Returning Data
- Ensure that the repository has **GitHub security alerts enabled**.
- Make sure your **GitHub PAT token** has `repo` and `security_events` permissions.

### ❌ SonarCloud API Returning No Issues
- Check if the repository is **registered on SonarCloud**.
- Ensure that the project key follows the format: `owner_repo`.

### ❌ NVD API Not Fetching CVEs
- Check if your API key is **valid and active**.
- Try using the `curl` request directly in a terminal.

---

## Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Added new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

---

## License
This project is licensed under the MIT License.



