export const isStudentRole = (user) => {
  return (
    user?.role === "STUDENT" ||
    user?.role === "VERIFIED_STUDENT"
  );
};

export const isSuperAdmin = (user) => {
  return user?.role === "SUPER_ADMIN";
};

export const isCollegeAdmin = (user) => {
  return user?.role === "COLLEGE_ADMIN";
};

export const isModerator = (user) => {
  return user?.role === "MODERATOR";
};

export const canApproveStudents = (user) => {
  return (
    user?.role === "SUPER_ADMIN" ||
    user?.role === "COLLEGE_ADMIN" ||
    user?.role === "MODERATOR"
  );
};