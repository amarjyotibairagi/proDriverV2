Create a production-ready 'schema.prisma' for the ProDriver LMS application.

Requirements:
1. Database: PostgreSQL.
2. Enums:
   - Role: BASIC, ADMIN.
   - TrainingStatus: NOT_STARTED, ONGOING, COMPLETED.
   - TestStatus: NOT_STARTED, ONGOING, PASSED, FAILED.

3. Models:
   - User:
     - Fields: id, employee_id (unique), password_hash, role, full_name, email, mobile_number, preferred_language.
     - Specific Logic: 'is_test_account' (Boolean) for shadow accounts.
     - Relations: Self-relation 'linked_parent' (One Admin can have one Trainee account). Links to Department, Designation, Location (Home & Assigned).

   - Master Data Tables:
     - Department (id, name, created_at).
     - Designation (id, name, created_at).
     - Location (id, name, type [HOME/ASSIGNED], created_at).

   - Module:
     - Fields: id, title, description, file_source (path to zip), thumbnail_url, total_marks, pass_marks, duration_minutes, is_active.
     - Note: Content is config-driven (CSV), so no separate 'Slide' table needed.

   - TrainingAssignment (Combined Assignment + Progress):
     - Links User and Module.
     - Fields: assigned_by (User relation), assigned_date, due_date.
     - Progress Fields: training_status, test_status, current_slide (Int), marks_obtained (Int), completion_date.

   - AuditLog:
     - Fields: id, action (String), actor_id (User), target_id (String/Int), timestamp.

4. Constraints:
   - Ensure 'employee_id' is unique.
   - Use UUIDs or CUIDs for IDs.
   - Add appropriate @@map names if necessary.




