# Changelog - ABCD Work Platform

## Version 1.0.5 (In Development)

### ✨ Features
- **Enhanced Email Recovery UI** - Better visual feedback for password reset process
- **Beautiful Email Templates** - Professional HTML emails for OTP delivery
- **SMTP Testing Tool** - `npm run smtp:test` to verify email configuration
- **Email Configuration Guide** - Comprehensive setup documentation (SMTP_SETUP_GUIDE.md)
- **Email Status Indicator** - Clear visual indicator showing if recovery is configured

### 🔧 Improvements
- Improved recovery flow UX with clearer instructions
- Better error messaging for unconfigured SMTP
- Enhanced bootstrap feedback
- Monospace OTP input for easier reading
- Email setup integrated into login page

### 📚 Documentation
- Added SMTP_SETUP_GUIDE.md with provider-specific instructions
- Gmail, SendGrid, Mailgun, AWS SES, Brevo setup guides
- Troubleshooting section for common issues

### 🔐 Security
- Real SMTP delivery ready (no fake OTP in UI when configured)
- Rate limiting on recovery requests (3 per email per 10 minutes)
- Secure email templates with security notices

---

## Version 1.0.4

### ✨ Initial Features
- **First-run Admin Bootstrap** - Initialize primary admin with network authority
- **Email OTP Recovery** - Admin password recovery via email verification
- **One-Admin-Per-Network** - Authority binding prevents multiple admins per LAN
- **Persistent Identity** - Network & device identity stored in ProgramData
- **NextAuth Integration** - Session management with role-based access
- **UI Bootstrap Flow** - Guided setup experience for first-time deployment
- **Admin Management** - Member and job management interfaces
- **POS Dashboard** - Transaction entry and member billing

### 🎯 Target Users
- Single-location POS operations
- Multi-location with network-isolated terminals
- LAN-based (offline-capable) deployments

### 📊 Database
- Prisma ORM with SQLite
- NetworkAuthority model for admin locking
- User model with email for recovery
- AdminRecoveryToken for OTP management
- Transaction, JobTemplate, Member tracking

### 🎨 UI Framework
- React 19 with Next.js 16
- Tailwind CSS 4 for styling
- Shadcn/ui components
- Tremor for analytics dashboards
- Electron for desktop app
- Electron Builder for Windows installer

### 🔒 Authentication
- NextAuth 4 with credentials provider
- bcryptjs password hashing
- SHA256-based OTP verification
- 10-minute OTP expiry
- 5-attempt limit on recovery

---

## Version 1.0.3

### Baseline Version
- Initial Electron/Next.js POS framework
- Basic authentication
- Database schema with Prisma
- Electron Builder setup

---

## Roadmap

### Tier 1 (Next Release - v1.0.6)
- [ ] Member Roles & Permissions (ADMIN, MANAGER, CLERK, MEMBER)
- [ ] Audit Logging (all admin actions + auth attempts)
- [ ] Multi-Admin Support (multiple admins per network with role-based control)

### Tier 2 (v1.0.7)
- [ ] TOTP / Authenticator App 2FA
- [ ] Database Backup & Restore
- [ ] Dark Mode Theme Toggle

### Tier 3 (v1.0.8+)
- [ ] QR Code based device enrollment
- [ ] Smart card / USB key authentication
- [ ] Multi-location sync (cloud-based federation)
- [ ] Real-time member app (React Native)
