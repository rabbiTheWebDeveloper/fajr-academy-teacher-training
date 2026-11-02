/**
 * Account roles, grouped by the collection each account lives in.
 * Dependency-free so proxy.js, models and API helpers can all import it.
 *
 *   users        (UserModel)        → admin, super-admin
 *   instructors  (InstructorModel)  → instructor
 *   tots         (TotModel)         → teacher, student, participant (paying trainees)
 */
export const ADMIN_ROLES = ["admin", "super-admin"];
export const INSTRUCTOR_ROLE = "instructor";
export const INSTRUCTOR_ROLES = [INSTRUCTOR_ROLE, ...ADMIN_ROLES]; // may open the instructor panel
export const TRAINEE_ROLES = ["teacher", "student", "participant"];
export const STAFF_ROLES = [...ADMIN_ROLES, INSTRUCTOR_ROLE];

export const isAdminRole = (role) => ADMIN_ROLES.includes(role);
export const isStaffRole = (role) => STAFF_ROLES.includes(role);

/** "admin" | "instructor" | "tot" | null — which collection an account with this role lives in. */
export function accountTypeForRole(role) {
  if (ADMIN_ROLES.includes(role)) return "admin";
  if (role === INSTRUCTOR_ROLE) return "instructor";
  if (TRAINEE_ROLES.includes(role)) return "tot";
  return null;
}

/** Landing page after login for each role. */
export function homeForRole(role) {
  const type = accountTypeForRole(role);
  if (type === "admin") return "/admin";
  if (type === "instructor") return "/instructor";
  return "/dashboard";
}
