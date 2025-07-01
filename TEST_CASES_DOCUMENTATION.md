# EcoWave Hub - Comprehensive Test Cases Documentation

## Table of Contents
1. [Authentication & Authorization Tests](#authentication--authorization-tests)
2. [Admin Dashboard Tests](#admin-dashboard-tests)
3. [Event Management Tests](#event-management-tests)
4. [User Management Tests](#user-management-tests)
5. [Rewards Management Tests](#rewards-management-tests)
6. [Feedback Management Tests](#feedback-management-tests)
7. [Admin History Tests](#admin-history-tests)
8. [Admin Profile Tests](#admin-profile-tests)
9. [Integration Tests](#integration-tests)
10. [Performance Tests](#performance-tests)

---

## Authentication & Authorization Tests

### TC-AUTH-001: Admin Login
**Priority:** Critical
**User Story:** As an Admin, I want to securely log into the system
**Test Steps:**
1. Navigate to login page
2. Enter valid admin credentials
3. Click "Sign In" button
**Expected Result:** Admin is logged in and redirected to dashboard
**Test Data:** Valid admin email and password

### TC-AUTH-002: Invalid Login
**Priority:** High
**Test Steps:**
1. Navigate to login page
2. Enter invalid credentials
3. Click "Sign In" button
**Expected Result:** Error message displayed, user remains on login page

### TC-AUTH-003: Admin Account Creation
**Priority:** High
**User Story:** As an Admin, I want to create new admin accounts
**Test Steps:**
1. Click "Need admin account? Create one"
2. Fill in registration form (name, email, password)
3. Click "Create Admin Account"
**Expected Result:** Account created successfully, confirmation message shown

### TC-AUTH-004: Session Management
**Priority:** High
**Test Steps:**
1. Login as admin
2. Close browser
3. Reopen and navigate to admin panel
**Expected Result:** User should be logged out and redirected to login

### TC-AUTH-005: Logout Functionality
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Click logout button
**Expected Result:** User logged out and redirected to login page

---

## Admin Dashboard Tests

### TC-DASH-001: View Total Platform Participants
**Priority:** Critical
**User Story:** As an Admin, I want to view total number of platform participants
**Acceptance Criteria:** View total number of platform participants
**Test Steps:**
1. Login as admin
2. Navigate to dashboard
3. Verify "Total Users" metric card is displayed
**Expected Result:** Metric card shows correct total number of active users

### TC-DASH-002: View Active Events Count
**Priority:** Critical
**User Story:** As an Admin, I want to view number of active events
**Acceptance Criteria:** View number of active events
**Test Steps:**
1. Login as admin
2. Navigate to dashboard
3. Verify "Active Events" metric card is displayed
**Expected Result:** Metric card shows correct number of current sustainability events

### TC-DASH-003: Navigate to Detailed Reports
**Priority:** High
**User Story:** As an Admin, I want to navigate to detailed reports or modules
**Acceptance Criteria:** Navigate to detailed reports or modules
**Test Steps:**
1. Login as admin
2. Navigate to dashboard
3. Click on "Total Users" metric card
**Expected Result:** Redirected to Users management page

### TC-DASH-004: Navigate to Events from Dashboard
**Priority:** High
**Test Steps:**
1. Login as admin
2. Navigate to dashboard
3. Click on "Active Events" metric card
**Expected Result:** Redirected to Events management page

### TC-DASH-005: View Monthly Engagement Trends
**Priority:** Medium
**User Story:** As an Admin, I want to view monthly engagement trends
**Acceptance Criteria:** View monthly engagement trends (optional)
**Test Steps:**
1. Login as admin
2. Navigate to dashboard
3. Locate "Monthly Engagement Trends" chart
**Expected Result:** Graph showing user participation over time, grouped by month

### TC-DASH-006: View Rewards Redeemed Metric
**Priority:** High
**Test Steps:**
1. Login as admin
2. Navigate to dashboard
3. Verify "Rewards Redeemed" metric card
**Expected Result:** Metric card shows correct number of redeemed rewards

### TC-DASH-007: View Engagement Rate Metric
**Priority:** High
**Test Steps:**
1. Login as admin
2. Navigate to dashboard
3. Verify "Engagement Rate" metric card
**Expected Result:** Metric card shows correct engagement percentage

### TC-DASH-008: Dashboard Data Refresh
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Note current metrics
3. Perform actions that change metrics (create event, add user)
4. Refresh dashboard
**Expected Result:** Metrics update to reflect changes

---

## Event Management Tests

### TC-EVENT-001: Create New Event
**Priority:** Critical
**User Story:** As an Admin, I want to create events
**Acceptance Criteria:** Create/Edit/Delete Events
**Test Steps:**
1. Login as admin
2. Navigate to Events section
3. Click "Create Event" button
4. Fill in event details (title, start date, end date, location, description)
5. Click "Create Event"
**Expected Result:** Event created successfully and appears in events list
**Test Data:** 
- Title: "Earth Day Cleanup"
- Start Date: Future date with time
- End Date: Future date after start date
- Location: "Central Park"
- Description: "Community cleanup event"

### TC-EVENT-002: Edit Existing Event
**Priority:** Critical
**User Story:** As an Admin, I want to edit events
**Acceptance Criteria:** Create/Edit/Delete Events
**Test Steps:**
1. Login as admin
2. Navigate to Events section
3. Click edit button on existing event
4. Modify event details
5. Click "Save Changes"
**Expected Result:** Event updated successfully with new information

### TC-EVENT-003: Delete Event
**Priority:** Critical
**User Story:** As an Admin, I want to delete events
**Acceptance Criteria:** Create/Edit/Delete Events
**Test Steps:**
1. Login as admin
2. Navigate to Events section
3. Click delete button on event
4. Confirm deletion
**Expected Result:** Event removed from system with confirmation message

### TC-EVENT-004: View Event Status
**Priority:** High
**User Story:** As an Admin, I want to view event status
**Acceptance Criteria:** View Event Status
**Test Steps:**
1. Login as admin
2. Navigate to Events section
3. Select an event
**Expected Result:** Event status (upcoming, ongoing, completed) and participant count displayed

### TC-EVENT-005: Update Event Status
**Priority:** High
**User Story:** As an Admin, I want to update event status
**Acceptance Criteria:** View Event Status
**Test Steps:**
1. Login as admin
2. Navigate to Events section
3. Select an event
4. Update status as needed
**Expected Result:** Event status updated successfully

### TC-EVENT-006: View Event Participants
**Priority:** High
**User Story:** As an Admin, I want to view and manage participants for events
**Acceptance Criteria:** View and Manage Participants for Events
**Test Steps:**
1. Login as admin
2. Navigate to Events section
3. Click on participant count for specific event
**Expected Result:** Redirected to page showing list of participants with key details

### TC-EVENT-007: Export Participant List
**Priority:** High
**User Story:** As an Admin, I want to export participant data
**Acceptance Criteria:** View and Manage Participants for Events
**Test Steps:**
1. Login as admin
2. Navigate to Events section
3. Select event with participants
4. Click "Export Participants" option
**Expected Result:** CSV file downloaded with all participant details

### TC-EVENT-008: Event Search Functionality
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Navigate to Events section
3. Enter search term in search box
**Expected Result:** Events filtered based on search criteria

### TC-EVENT-009: Event Filter by Status
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Navigate to Events section
3. Select status filter (upcoming, ongoing, completed)
**Expected Result:** Events filtered by selected status

### TC-EVENT-010: Event Sort Functionality
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Navigate to Events section
3. Click sort options (name, date, location, participants)
**Expected Result:** Events sorted according to selected criteria

### TC-EVENT-011: Event Image Upload
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Create/edit event
3. Upload event image
**Expected Result:** Image uploaded and displayed in event card

### TC-EVENT-012: Event Date Validation
**Priority:** High
**Test Steps:**
1. Login as admin
2. Create event with end date before start date
3. Attempt to save
**Expected Result:** Validation error displayed, event not saved

---

## User Management Tests

### TC-USER-001: View User List with Roles and Points
**Priority:** Critical
**User Story:** As an Admin, I want to view user list with roles and points
**Acceptance Criteria:** User List with Roles and Points
**Test Steps:**
1. Login as admin
2. Navigate to User Management page
3. View list of users
**Expected Result:** User's role (User or Admin) and total points displayed next to their name

### TC-USER-002: Assign or Change User Role
**Priority:** Critical
**User Story:** As an Admin, I want to assign or change user roles
**Acceptance Criteria:** Assign or Change a Role
**Test Steps:**
1. Login as admin
2. Navigate to User Management page
3. Select user profile
4. Change role using dropdown menu
5. Save changes
**Expected Result:** User role updated successfully

### TC-USER-003: User Role Restrictions
**Priority:** High
**User Story:** As an Admin, I want to ensure proper role restrictions
**Acceptance Criteria:** User Role Restrictions
**Test Steps:**
1. Login as admin
2. Attempt to assign Admin role to user
3. Verify restrictions are in place
**Expected Result:** Only eligible users can have Admin role

### TC-USER-004: Delete User Data
**Priority:** High
**User Story:** As an Admin, I want to delete user data
**Acceptance Criteria:** Admin Deletes User Data
**Test Steps:**
1. Login as admin
2. Navigate to User Management page
3. Locate user who left company
4. Click "Delete" button
5. Confirm deletion
**Expected Result:** User data permanently removed with confirmation message

### TC-USER-005: Add Points Manually
**Priority:** High
**User Story:** As an Admin, I want to add points manually
**Acceptance Criteria:** Add Points Manually
**Test Steps:**
1. Login as admin
2. Navigate to user profile
3. Enter point value to add
4. Save changes
**Expected Result:** Points added to user's total points

### TC-USER-006: Save and Confirm Role/Points Changes
**Priority:** High
**User Story:** As an Admin, I want to confirm changes
**Acceptance Criteria:** Save and Confirm Role/Points Changes
**Test Steps:**
1. Login as admin
2. Change user role or update points
3. Save changes
**Expected Result:** Confirmation message displayed, changes reflected immediately

### TC-USER-007: Create New User
**Priority:** High
**Test Steps:**
1. Login as admin
2. Navigate to User Management
3. Click "Add User" button
4. Fill in user details (name, email, role)
5. Save user
**Expected Result:** New user created successfully

### TC-USER-008: User Search Functionality
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Navigate to User Management
3. Enter search term in search box
**Expected Result:** Users filtered based on search criteria

### TC-USER-009: User Filter by Role
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Navigate to User Management
3. Select role filter (Admin, User)
**Expected Result:** Users filtered by selected role

### TC-USER-010: User Pagination
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Navigate to User Management with many users
3. Navigate through pages
**Expected Result:** Users displayed across multiple pages correctly

---

## Rewards Management Tests

### TC-REWARD-001: Create New Reward
**Priority:** Critical
**User Story:** As an Admin, I want to create new rewards
**Acceptance Criteria:** Create/Edit/Delete Rewards
**Test Steps:**
1. Login as admin
2. Navigate to Rewards section
3. Click "Add Reward" button
4. Enter reward details (name, description, points required, stock, image)
5. Save reward
**Expected Result:** New reward created successfully
**Test Data:**
- Name: "Eco-friendly Water Bottle"
- Description: "Sustainable water bottle made from recycled materials"
- Points Required: 500
- Stock: 20

### TC-REWARD-002: Edit Existing Reward
**Priority:** Critical
**User Story:** As an Admin, I want to edit existing rewards
**Acceptance Criteria:** Create/Edit/Delete Rewards
**Test Steps:**
1. Login as admin
2. Navigate to Rewards section
3. Click edit button on existing reward
4. Modify reward details
5. Save changes
**Expected Result:** Reward updated successfully

### TC-REWARD-003: Delete Reward
**Priority:** Critical
**User Story:** As an Admin, I want to delete rewards
**Acceptance Criteria:** Create/Edit/Delete Rewards
**Test Steps:**
1. Login as admin
2. Navigate to Rewards section
3. Click delete button on reward
4. Confirm deletion
**Expected Result:** Reward removed after confirmation

### TC-REWARD-004: View Redemption History
**Priority:** High
**User Story:** As an Admin, I want to track redemption history
**Acceptance Criteria:** Track Redemption History
**Test Steps:**
1. Login as admin
2. Navigate to Rewards section
3. Select a reward
4. View redemption history
**Expected Result:** List of participants who redeemed reward with redemption date and points used

### TC-REWARD-005: Track Points Used
**Priority:** High
**User Story:** As an Admin, I want to track points used
**Acceptance Criteria:** Track Redemption History
**Test Steps:**
1. Login as admin
2. Navigate to Rewards section
3. Select a reward
4. View total points used
**Expected Result:** Total points used for each reward displayed

### TC-REWARD-006: Reward Search Functionality
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Navigate to Rewards section
3. Enter search term
**Expected Result:** Rewards filtered based on search criteria

### TC-REWARD-007: Reward Filter by Status
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Navigate to Rewards section
3. Filter by availability (Available, Out of Stock)
**Expected Result:** Rewards filtered by selected status

### TC-REWARD-008: Export Redemption Data
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Navigate to Rewards section
3. Select reward with redemptions
4. Export redemption data
**Expected Result:** CSV file downloaded with redemption details

### TC-REWARD-009: Reward Image Upload
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Create/edit reward
3. Upload reward image
**Expected Result:** Image uploaded and displayed in reward card

### TC-REWARD-010: Reward Stock Management
**Priority:** High
**Test Steps:**
1. Login as admin
2. Create reward with limited stock
3. Verify stock tracking
**Expected Result:** Stock count decreases with redemptions, shows "Out of Stock" when depleted

---

## Feedback Management Tests

### TC-FEEDBACK-001: View Feedback for All Events
**Priority:** Critical
**User Story:** As an Admin, I want to view feedback from participants
**Acceptance Criteria:** View Feedback for All Events
**Test Steps:**
1. Login as admin
2. Navigate to Feedback section
3. View list of completed events
**Expected Result:** List of completed events with number of feedback responses for each

### TC-FEEDBACK-002: View Event-Specific Feedback
**Priority:** Critical
**User Story:** As an Admin, I want to view feedback for specific events
**Acceptance Criteria:** View Feedback for All Events
**Test Steps:**
1. Login as admin
2. Navigate to Feedback section
3. Click on an event
**Expected Result:** All feedback submitted by participants for that event displayed with ratings and comments

### TC-FEEDBACK-003: Export Feedback Data
**Priority:** High
**User Story:** As an Admin, I want to export feedback data
**Acceptance Criteria:** Export Feedback Data
**Test Steps:**
1. Login as admin
2. Navigate to Feedback section
3. View feedback for an event
4. Select export option
**Expected Result:** All feedback responses exported to CSV file for analysis

### TC-FEEDBACK-004: Delete Feedback
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Navigate to Feedback section
3. Select feedback item
4. Delete feedback
**Expected Result:** Feedback removed from system

### TC-FEEDBACK-005: Mark Feedback as Read
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Navigate to Feedback section
3. Select feedback item
4. Mark as read
**Expected Result:** Feedback marked as read status

### TC-FEEDBACK-006: Filter Feedback by Rating
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Navigate to Feedback section
3. Filter by rating (1-5 stars)
**Expected Result:** Feedback filtered by selected rating range

### TC-FEEDBACK-007: Search Feedback
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Navigate to Feedback section
3. Search feedback by user or content
**Expected Result:** Feedback filtered based on search criteria

### TC-FEEDBACK-008: View Feedback Statistics
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Navigate to Feedback section
3. View overall feedback statistics
**Expected Result:** Average ratings, total feedback count, and trends displayed

---

## Admin History Tests

### TC-HISTORY-001: View Admin Activity Log
**Priority:** Critical
**User Story:** As an Admin, I want to view log of all admin actions
**Acceptance Criteria:** View Admin History
**Test Steps:**
1. Login as admin
2. Navigate to "Admin History" section
**Expected Result:** Chronological list of all admin actions with action type, admin name, affected item, and timestamp

### TC-HISTORY-002: Filter History by Action Type
**Priority:** High
**Test Steps:**
1. Login as admin
2. Navigate to Admin History
3. Filter by action type (Create, Update, Delete)
**Expected Result:** History filtered by selected action type

### TC-HISTORY-003: Filter History by Time Range
**Priority:** High
**Test Steps:**
1. Login as admin
2. Navigate to Admin History
3. Filter by time range (Today, Week, Month)
**Expected Result:** History filtered by selected time period

### TC-HISTORY-004: Search Admin History
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Navigate to Admin History
3. Search by admin name or action details
**Expected Result:** History filtered based on search criteria

### TC-HISTORY-005: View Detailed Action Information
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Navigate to Admin History
3. Click on specific action entry
**Expected Result:** Detailed information about the action displayed

### TC-HISTORY-006: Export Admin History
**Priority:** Low
**Test Steps:**
1. Login as admin
2. Navigate to Admin History
3. Export history data
**Expected Result:** Admin history exported to CSV file

---

## Admin Profile Tests

### TC-PROFILE-001: View Admin Profile
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Navigate to Admin Profile
**Expected Result:** Admin profile information displayed correctly

### TC-PROFILE-002: Edit Admin Profile
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Navigate to Admin Profile
3. Edit profile information
4. Save changes
**Expected Result:** Profile updated successfully

### TC-PROFILE-003: Change Password
**Priority:** High
**Test Steps:**
1. Login as admin
2. Navigate to Admin Profile
3. Change password
4. Save changes
**Expected Result:** Password updated successfully

### TC-PROFILE-004: Upload Profile Picture
**Priority:** Low
**Test Steps:**
1. Login as admin
2. Navigate to Admin Profile
3. Upload new profile picture
**Expected Result:** Profile picture updated successfully

---

## Integration Tests

### TC-INT-001: End-to-End Event Creation and Management
**Priority:** Critical
**Test Steps:**
1. Login as admin
2. Create new event
3. Verify event appears in dashboard metrics
4. Edit event details
5. View event in events list
6. Delete event
7. Verify event removed from all locations
**Expected Result:** Complete event lifecycle works correctly

### TC-INT-002: User Points and Rewards Integration
**Priority:** Critical
**Test Steps:**
1. Login as admin
2. Add points to user
3. Create reward requiring those points
4. Verify user can redeem reward
5. Check redemption history
**Expected Result:** Points and rewards system works together correctly

### TC-INT-003: Admin Actions Logging
**Priority:** High
**Test Steps:**
1. Login as admin
2. Perform various actions (create event, edit user, delete reward)
3. Navigate to Admin History
4. Verify all actions are logged
**Expected Result:** All admin actions properly logged with correct details

### TC-INT-004: Data Consistency Across Modules
**Priority:** High
**Test Steps:**
1. Login as admin
2. Create event with participants
3. Check participant count in events
4. Verify same count in dashboard
5. Export participant data
6. Verify data consistency
**Expected Result:** Data remains consistent across all modules

---

## Performance Tests

### TC-PERF-001: Dashboard Load Time
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Measure time to load dashboard
**Expected Result:** Dashboard loads within 3 seconds

### TC-PERF-002: Large Data Set Handling
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Navigate to section with large data set (1000+ records)
3. Test pagination and filtering
**Expected Result:** System handles large data sets efficiently

### TC-PERF-003: Concurrent Admin Sessions
**Priority:** Low
**Test Steps:**
1. Login with multiple admin accounts simultaneously
2. Perform actions concurrently
**Expected Result:** System handles multiple concurrent sessions

### TC-PERF-004: File Upload Performance
**Priority:** Medium
**Test Steps:**
1. Login as admin
2. Upload large image files for events/rewards
**Expected Result:** Files upload within reasonable time limits

---

## Test Data Requirements

### Users Test Data
- Admin User: admin@ecowave.com / password123
- Regular User: user@ecowave.com / password123
- Test User for Deletion: temp@ecowave.com / password123

### Events Test Data
- Upcoming Event: "Future Earth Day Cleanup" (future date)
- Ongoing Event: "Current Recycling Drive" (current date)
- Completed Event: "Past Tree Planting" (past date)

### Rewards Test Data
- Low Points Reward: "Eco Sticker" (50 points)
- Medium Points Reward: "Water Bottle" (500 points)
- High Points Reward: "Solar Charger" (1000 points)

### Feedback Test Data
- High Rating Feedback: 5 stars with positive comments
- Low Rating Feedback: 2 stars with improvement suggestions
- No Rating Feedback: Comments only

---

## Test Environment Setup

### Prerequisites
1. Admin account with full permissions
2. Test database with sample data
3. Image files for upload testing
4. CSV export verification tools

### Browser Compatibility
- Chrome (latest version)
- Firefox (latest version)
- Safari (latest version)
- Edge (latest version)

### Test Execution Schedule
1. **Smoke Tests**: Run before each deployment
2. **Regression Tests**: Run weekly
3. **Full Test Suite**: Run before major releases
4. **Performance Tests**: Run monthly

---

## Test Metrics and Reporting

### Success Criteria
- 100% of Critical priority tests must pass
- 95% of High priority tests must pass
- 90% of Medium priority tests must pass
- 80% of Low priority tests must pass

### Defect Classification
- **Critical**: System crash, data loss, security breach
- **High**: Major functionality broken
- **Medium**: Minor functionality issues
- **Low**: UI/UX improvements

### Test Coverage
- Functional Coverage: 100% of user stories
- Code Coverage: Target 80%
- Browser Coverage: All major browsers
- Device Coverage: Desktop and tablet

---

## Conclusion

This comprehensive test suite covers all major functionalities of the EcoWave Hub admin panel based on the provided user stories and acceptance criteria. The tests are designed to ensure system reliability, data integrity, and user experience quality.

Regular execution of these test cases will help maintain system quality and catch issues early in the development cycle.