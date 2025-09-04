# ALX Polly: A Polling Application

Welcome to ALX Polly, a full-stack polling application built with Next.js, TypeScript, and Supabase. This project serves as a practical learning ground for modern web development concepts, with a special focus on security best practices.

---

## 🚨 Security Audit: Vulnerabilities & Remediation

As part of a comprehensive security audit, several vulnerabilities were identified in ALX Polly. This section outlines each flaw, its potential impact, and the remedial steps taken to secure the application.

### 1. **Broken Authentication & Session Management**
- **Flaw:** Sessions were not invalidated upon logout, allowing for potential session hijacking.
- **Impact:** Attackers could reuse stale session tokens to impersonate users.
- **Remediation:** Implemented proper session invalidation and ensured JWTs are securely deleted on logout. Added short-lived tokens and refresh mechanisms.

### 2. **Insufficient Access Controls**
- **Flaw:** API endpoints lacked robust authorization checks; users could access, modify, or delete polls not belonging to them via crafted requests.
- **Impact:** Unauthorized access to or manipulation of other users' data.
- **Remediation:** Enforced ownership checks on all poll-related actions. Added middleware to validate user identity before permitting access to sensitive operations.

### 3. **SQL Injection via Unsafe Query Construction**
- **Flaw:** Some database queries directly interpolated user input, allowing for potential SQL injection.
- **Impact:** Attackers could manipulate queries to exfiltrate or corrupt database records.
- **Remediation:** Refactored all queries to use parameterized statements and sanitized user input.

### 4. **Cross-Site Scripting (XSS)**
- **Flaw:** User-generated content (poll questions/answers) was rendered without sufficient sanitization.
- **Impact:** Attackers could inject malicious scripts, compromising user sessions and data.
- **Remediation:** Integrated input sanitization and output escaping on all user-provided fields. Utilized libraries for robust XSS protection.

### 5. **Cross-Site Request Forgery (CSRF)**
- **Flaw:** Some state-changing endpoints (e.g., poll creation, voting) were vulnerable to CSRF due to missing anti-CSRF tokens.
- **Impact:** Attackers could trick authenticated users into performing unintended actions.
- **Remediation:** Implemented CSRF tokens for all critical POST/PUT/DELETE requests.

### 6. **Exposed Environment Variables and Secrets**
- **Flaw:** The repository previously contained hardcoded Supabase keys and secrets.
- **Impact:** Credential leakage could allow attackers to gain direct access to the backend.
- **Remediation:** Removed secrets from source control and enforced the use of `.env.local`. Added `.gitignore` rules and rotated credentials.

### 7. **Insecure Direct Object References (IDOR)**
- **Flaw:** Poll and user IDs passed in requests were not sufficiently validated.
- **Impact:** Attackers could enumerate resources and access other users' polls.
- **Remediation:** Added strict validation and ownership checks for resource access. Implemented UUIDs and opaque identifiers.

### 8. **Rate Limiting and Abuse**
- **Flaw:** No protection against brute-force attacks or API abuse (e.g., spamming poll creation).
- **Impact:** Service disruption and increased risk of attacks.
- **Remediation:** Added rate limiting to authentication and poll endpoints using middleware.

### 9. **Improper Error Handling**
- **Flaw:** Detailed error messages leaked stack traces and internal logic.
- **Impact:** Attackers could gain insights for further exploitation.
- **Remediation:** Standardized error responses and hid internal details from clients.

---

## 🛡️ General Remediation Steps

1. **Code Review & Refactoring:** All modules were reviewed for security flaws. Query logic and API routes were refactored for safety.
2. **Dependency Updates:** Upgraded all dependencies to patch known vulnerabilities.
3. **Automated Security Testing:** Integrated vulnerability scanners and static analysis tools into the CI pipeline.
4. **Documentation & Developer Training:** Added secure coding guidelines and onboarding documentation.
5. **Monitoring & Alerting:** Enabled logging and monitoring of suspicious activity in the backend.

---

## ✅ How to Run the Secured Application

1. Clone the repository and install dependencies:
    ```bash
    git clone <repository-url>
    cd alx-polly
    npm install
    ```

2. Set up your Supabase project and create a `.env.local` file with your credentials.
    - **Do NOT commit this file to source control!**

3. Start the development server:
    ```bash
    npm run dev
    ```

4. Access the application at [http://localhost:3000](http://localhost:3000)

---

## 📝 Notes for Auditors & Contributors

- Please review the `/app/lib/actions/` and `/app/(dashboard)/` directories for critical business logic.
- All contributions should adhere to the security guidelines outlined above.
- For further recommendations or to report vulnerabilities, open an issue or pull request.

Happy and secure coding!
