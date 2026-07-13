// import React, {
//   createContext,
//   useEffect,
//   useState,
// } from "react";

// import API from "./api";

// export const AuthContext =
//   createContext(null);

// export function AuthProvider({
//   children,
// }) {

//   const [token, setToken] =
//     useState(null);

//   const [user, setUser] =
//     useState(null);

//   useEffect(() => {

//     if (
//       typeof window !==
//       "undefined"
//     ) {

//       const storedToken =
//         localStorage.getItem(
//           "token"
//         );

//       if (storedToken) {

//         setToken(
//           storedToken
//         );

//         fetchProfile();
//       }
//     }

//   }, []);

//   const fetchProfile =
//     async () => {

//       try {

//         const res =
//           await API.get(
//             "/profile/me"
//           );

//         setUser(
//           res.data.user
//         );

//       } catch (error) {

//         console.log(error);
//       }
//     };

//   const logout = () => {

//     localStorage.removeItem(
//       "token"
//     );

//     setToken(null);

//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         token,
//         setToken,
//         user,
//         setUser,
//         fetchProfile,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }