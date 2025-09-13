/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./contexts/NextAuthContext.tsx":
/*!**************************************!*\
  !*** ./contexts/NextAuthContext.tsx ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AuthProvider: () => (/* binding */ AuthProvider),\n/* harmony export */   useAuth: () => (/* binding */ useAuth)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_auth_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth/react */ \"next-auth/react\");\n/* harmony import */ var next_auth_react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_auth_react__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\nconst AuthContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)(undefined);\nconst useAuth = ()=>{\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(AuthContext);\n    if (context === undefined) {\n        throw new Error(\"useAuth must be used within an AuthProvider\");\n    }\n    return context;\n};\nconst AuthProvider = ({ children })=>{\n    const { data: session, status } = (0,next_auth_react__WEBPACK_IMPORTED_MODULE_2__.useSession)();\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter)();\n    const loading = status === \"loading\";\n    const user = session?.user ? {\n        id: session.user.id,\n        email: session.user.email,\n        name: session.user.name,\n        phone: session.user.phone,\n        walletBalance: session.user.walletBalance,\n        bonusWallet: session.user.bonusWallet,\n        totalReferrals: session.user.totalReferrals,\n        referralCode: session.user.referralCode,\n        emailVerified: session.user.emailVerified,\n        role: session.user.role\n    } : null;\n    const login = async (email, password)=>{\n        const result = await (0,next_auth_react__WEBPACK_IMPORTED_MODULE_2__.signIn)(\"credentials\", {\n            email,\n            password,\n            redirect: false\n        });\n        if (result?.error) {\n            throw new Error(result.error);\n        }\n        if (result?.ok) {\n            router.push(\"/dashboard\");\n        }\n    };\n    const register = async (userData)=>{\n        try {\n            const response = await fetch(\"/api/auth/register\", {\n                method: \"POST\",\n                headers: {\n                    \"Content-Type\": \"application/json\"\n                },\n                body: JSON.stringify(userData)\n            });\n            const data = await response.json();\n            if (!response.ok) {\n                throw new Error(data.message || \"Registration failed\");\n            }\n            return {\n                needsVerification: data.needsVerification\n            };\n        } catch (error) {\n            console.error(\"Registration error:\", error);\n            throw new Error(error.message || \"Registration failed\");\n        }\n    };\n    const logout = ()=>{\n        (0,next_auth_react__WEBPACK_IMPORTED_MODULE_2__.signOut)({\n            callbackUrl: \"/\"\n        });\n    };\n    const refreshUser = async ()=>{\n        // Force session update by calling getSession\n        const { data } = await fetch(\"/api/auth/session\").then((res)=>res.json());\n        if (data) {\n            // Session will be updated automatically by next-auth\n            router.reload();\n        }\n    };\n    const value = {\n        user,\n        loading,\n        login,\n        register,\n        logout,\n        refreshUser\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(AuthContext.Provider, {\n        value: value,\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\Sammy\\\\OneDrive\\\\Desktop\\\\provenv\\\\contexts\\\\NextAuthContext.tsx\",\n        lineNumber: 130,\n        columnNumber: 5\n    }, undefined);\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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cHJvdmVudi1uZXh0anMvLi9jb250ZXh0cy9OZXh0QXV0aENvbnRleHQudHN4PzgzOTEiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZUNvbnRleHQsIHVzZUNvbnRleHQsIFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgdXNlU2Vzc2lvbiwgc2lnbkluLCBzaWduT3V0IH0gZnJvbSAnbmV4dC1hdXRoL3JlYWN0JztcclxuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSAnbmV4dC9yb3V0ZXInO1xyXG5cclxuaW50ZXJmYWNlIEF1dGhVc2VyIHtcclxuICBpZDogc3RyaW5nO1xyXG4gIGVtYWlsOiBzdHJpbmc7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIHBob25lOiBzdHJpbmc7XHJcbiAgd2FsbGV0QmFsYW5jZTogbnVtYmVyO1xyXG4gIGJvbnVzV2FsbGV0OiBudW1iZXI7XHJcbiAgdG90YWxSZWZlcnJhbHM6IG51bWJlcjtcclxuICByZWZlcnJhbENvZGU6IHN0cmluZztcclxuICBlbWFpbFZlcmlmaWVkOiBib29sZWFuO1xyXG4gIHJvbGU/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBSZWdpc3RlckRhdGEge1xyXG4gIG5hbWU6IHN0cmluZztcclxuICBlbWFpbDogc3RyaW5nO1xyXG4gIHBob25lOiBzdHJpbmc7XHJcbiAgcGFzc3dvcmQ6IHN0cmluZztcclxuICByZWZlcnJhbF9jb2RlPzogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQXV0aENvbnRleHRUeXBlIHtcclxuICB1c2VyOiBBdXRoVXNlciB8IG51bGw7XHJcbiAgbG9hZGluZzogYm9vbGVhbjtcclxuICBsb2dpbjogKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpID0+IFByb21pc2U8dm9pZD47XHJcbiAgcmVnaXN0ZXI6ICh1c2VyRGF0YTogUmVnaXN0ZXJEYXRhKSA9PiBQcm9taXNlPHsgbmVlZHNWZXJpZmljYXRpb246IGJvb2xlYW4gfT47XHJcbiAgbG9nb3V0OiAoKSA9PiB2b2lkO1xyXG4gIHJlZnJlc2hVc2VyOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xyXG59XHJcblxyXG5jb25zdCBBdXRoQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQ8QXV0aENvbnRleHRUeXBlIHwgdW5kZWZpbmVkPih1bmRlZmluZWQpO1xyXG5cclxuZXhwb3J0IGNvbnN0IHVzZUF1dGggPSAoKSA9PiB7XHJcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoQXV0aENvbnRleHQpO1xyXG4gIGlmIChjb250ZXh0ID09PSB1bmRlZmluZWQpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcigndXNlQXV0aCBtdXN0IGJlIHVzZWQgd2l0aGluIGFuIEF1dGhQcm92aWRlcicpO1xyXG4gIH1cclxuICByZXR1cm4gY29udGV4dDtcclxufTtcclxuXHJcbmludGVyZmFjZSBBdXRoUHJvdmlkZXJQcm9wcyB7XHJcbiAgY2hpbGRyZW46IFJlYWN0Tm9kZTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IEF1dGhQcm92aWRlcjogUmVhY3QuRkM8QXV0aFByb3ZpZGVyUHJvcHM+ID0gKHsgY2hpbGRyZW4gfSkgPT4ge1xyXG4gIGNvbnN0IHsgZGF0YTogc2Vzc2lvbiwgc3RhdHVzIH0gPSB1c2VTZXNzaW9uKCk7XHJcbiAgY29uc3Qgcm91dGVyID0gdXNlUm91dGVyKCk7XHJcblxyXG4gIGNvbnN0IGxvYWRpbmcgPSBzdGF0dXMgPT09ICdsb2FkaW5nJztcclxuICBcclxuICBjb25zdCB1c2VyOiBBdXRoVXNlciB8IG51bGwgPSBzZXNzaW9uPy51c2VyID8ge1xyXG4gICAgaWQ6IHNlc3Npb24udXNlci5pZCBhcyBzdHJpbmcsXHJcbiAgICBlbWFpbDogc2Vzc2lvbi51c2VyLmVtYWlsISxcclxuICAgIG5hbWU6IHNlc3Npb24udXNlci5uYW1lISxcclxuICAgIHBob25lOiBzZXNzaW9uLnVzZXIucGhvbmUgYXMgc3RyaW5nLFxyXG4gICAgd2FsbGV0QmFsYW5jZTogc2Vzc2lvbi51c2VyLndhbGxldEJhbGFuY2UgYXMgbnVtYmVyLFxyXG4gICAgYm9udXNXYWxsZXQ6IHNlc3Npb24udXNlci5ib251c1dhbGxldCBhcyBudW1iZXIsXHJcbiAgICB0b3RhbFJlZmVycmFsczogc2Vzc2lvbi51c2VyLnRvdGFsUmVmZXJyYWxzIGFzIG51bWJlcixcclxuICAgIHJlZmVycmFsQ29kZTogc2Vzc2lvbi51c2VyLnJlZmVycmFsQ29kZSBhcyBzdHJpbmcsXHJcbiAgICBlbWFpbFZlcmlmaWVkOiBzZXNzaW9uLnVzZXIuZW1haWxWZXJpZmllZCBhcyBib29sZWFuLFxyXG4gICAgcm9sZTogc2Vzc2lvbi51c2VyLnJvbGVcclxuICB9IDogbnVsbDtcclxuXHJcbiAgY29uc3QgbG9naW4gPSBhc3luYyAoZW1haWw6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZykgPT4ge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2lnbkluKCdjcmVkZW50aWFscycsIHtcclxuICAgICAgZW1haWwsXHJcbiAgICAgIHBhc3N3b3JkLFxyXG4gICAgICByZWRpcmVjdDogZmFsc2UsXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAocmVzdWx0Py5lcnJvcikge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LmVycm9yKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVzdWx0Py5vaykge1xyXG4gICAgICByb3V0ZXIucHVzaCgnL2Rhc2hib2FyZCcpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IHJlZ2lzdGVyID0gYXN5bmMgKHVzZXJEYXRhOiBSZWdpc3RlckRhdGEpOiBQcm9taXNlPHsgbmVlZHNWZXJpZmljYXRpb246IGJvb2xlYW4gfT4gPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnL2FwaS9hdXRoL3JlZ2lzdGVyJywge1xyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh1c2VyRGF0YSksXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuXHJcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YS5tZXNzYWdlIHx8ICdSZWdpc3RyYXRpb24gZmFpbGVkJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB7IG5lZWRzVmVyaWZpY2F0aW9uOiBkYXRhLm5lZWRzVmVyaWZpY2F0aW9uIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1JlZ2lzdHJhdGlvbiBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5tZXNzYWdlIHx8ICdSZWdpc3RyYXRpb24gZmFpbGVkJyk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbG9nb3V0ID0gKCkgPT4ge1xyXG4gICAgc2lnbk91dCh7IGNhbGxiYWNrVXJsOiAnLycgfSk7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgcmVmcmVzaFVzZXIgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAvLyBGb3JjZSBzZXNzaW9uIHVwZGF0ZSBieSBjYWxsaW5nIGdldFNlc3Npb25cclxuICAgIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgZmV0Y2goJy9hcGkvYXV0aC9zZXNzaW9uJykudGhlbihyZXMgPT4gcmVzLmpzb24oKSk7XHJcbiAgICBpZiAoZGF0YSkge1xyXG4gICAgICAvLyBTZXNzaW9uIHdpbGwgYmUgdXBkYXRlZCBhdXRvbWF0aWNhbGx5IGJ5IG5leHQtYXV0aFxyXG4gICAgICByb3V0ZXIucmVsb2FkKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgdmFsdWUgPSB7XHJcbiAgICB1c2VyLFxyXG4gICAgbG9hZGluZyxcclxuICAgIGxvZ2luLFxyXG4gICAgcmVnaXN0ZXIsXHJcbiAgICBsb2dvdXQsXHJcbiAgICByZWZyZXNoVXNlclxyXG4gIH07XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8QXV0aENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3ZhbHVlfT5cclxuICAgICAge2NoaWxkcmVufVxyXG4gICAgPC9BdXRoQ29udGV4dC5Qcm92aWRlcj5cclxuICApO1xyXG59O1xyXG5cclxuLy8gVHlwZSBleHRlbnNpb24gZm9yIE5leHRBdXRoXHJcbmRlY2xhcmUgbW9kdWxlICduZXh0LWF1dGgnIHtcclxuICBpbnRlcmZhY2UgVXNlciB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgZW1haWw6IHN0cmluZztcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIHBob25lOiBzdHJpbmc7XHJcbiAgICB3YWxsZXRCYWxhbmNlOiBudW1iZXI7XHJcbiAgICBib251c1dhbGxldDogbnVtYmVyO1xyXG4gICAgdG90YWxSZWZlcnJhbHM6IG51bWJlcjtcclxuICAgIHJlZmVycmFsQ29kZTogc3RyaW5nO1xyXG4gICAgZW1haWxWZXJpZmllZDogYm9vbGVhbjtcclxuICAgIHJvbGU/OiBzdHJpbmc7XHJcbiAgfVxyXG5cclxuICBpbnRlcmZhY2UgU2Vzc2lvbiB7XHJcbiAgICB1c2VyOiB7XHJcbiAgICAgIGlkOiBzdHJpbmc7XHJcbiAgICAgIGVtYWlsOiBzdHJpbmc7XHJcbiAgICAgIG5hbWU6IHN0cmluZztcclxuICAgICAgcGhvbmU6IHN0cmluZztcclxuICAgICAgd2FsbGV0QmFsYW5jZTogbnVtYmVyO1xyXG4gICAgICBib251c1dhbGxldDogbnVtYmVyO1xyXG4gICAgICB0b3RhbFJlZmVycmFsczogbnVtYmVyO1xyXG4gICAgICByZWZlcnJhbENvZGU6IHN0cmluZztcclxuICAgICAgZW1haWxWZXJpZmllZDogYm9vbGVhbjtcclxuICAgICAgcm9sZT86IHN0cmluZztcclxuICAgIH07XHJcbiAgfVxyXG59XHJcblxyXG5kZWNsYXJlIG1vZHVsZSAnbmV4dC1hdXRoL2p3dCcge1xyXG4gIGludGVyZmFjZSBKV1Qge1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIHBob25lOiBzdHJpbmc7XHJcbiAgICB3YWxsZXRCYWxhbmNlOiBudW1iZXI7XHJcbiAgICBib251c1dhbGxldDogbnVtYmVyO1xyXG4gICAgdG90YWxSZWZlcnJhbHM6IG51bWJlcjtcclxuICAgIHJlZmVycmFsQ29kZTogc3RyaW5nO1xyXG4gICAgZW1haWxWZXJpZmllZDogYm9vbGVhbjtcclxuICAgIHJvbGU/OiBzdHJpbmc7XHJcbiAgfVxyXG59XHJcbiJdLCJuYW1lcyI6WyJSZWFjdCIsImNyZWF0ZUNvbnRleHQiLCJ1c2VDb250ZXh0IiwidXNlU2Vzc2lvbiIsInNpZ25JbiIsInNpZ25PdXQiLCJ1c2VSb3V0ZXIiLCJBdXRoQ29udGV4dCIsInVuZGVmaW5lZCIsInVzZUF1dGgiLCJjb250ZXh0IiwiRXJyb3IiLCJBdXRoUHJvdmlkZXIiLCJjaGlsZHJlbiIsImRhdGEiLCJzZXNzaW9uIiwic3RhdHVzIiwicm91dGVyIiwibG9hZGluZyIsInVzZXIiLCJpZCIsImVtYWlsIiwibmFtZSIsInBob25lIiwid2FsbGV0QmFsYW5jZSIsImJvbnVzV2FsbGV0IiwidG90YWxSZWZlcnJhbHMiLCJyZWZlcnJhbENvZGUiLCJlbWFpbFZlcmlmaWVkIiwicm9sZSIsImxvZ2luIiwicGFzc3dvcmQiLCJyZXN1bHQiLCJyZWRpcmVjdCIsImVycm9yIiwib2siLCJwdXNoIiwicmVnaXN0ZXIiLCJ1c2VyRGF0YSIsInJlc3BvbnNlIiwiZmV0Y2giLCJtZXRob2QiLCJoZWFkZXJzIiwiYm9keSIsIkpTT04iLCJzdHJpbmdpZnkiLCJqc29uIiwibWVzc2FnZSIsIm5lZWRzVmVyaWZpY2F0aW9uIiwiY29uc29sZSIsImxvZ291dCIsImNhbGxiYWNrVXJsIiwicmVmcmVzaFVzZXIiLCJ0aGVuIiwicmVzIiwicmVsb2FkIiwidmFsdWUiLCJQcm92aWRlciJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./contexts/NextAuthContext.tsx\n");

/***/ }),

/***/ "./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/react */ \"next-auth/react\");\n/* harmony import */ var next_auth_react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth_react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _contexts_NextAuthContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../contexts/NextAuthContext */ \"./contexts/NextAuthContext.tsx\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\nfunction App({ Component, pageProps: { session, ...pageProps } }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_auth_react__WEBPACK_IMPORTED_MODULE_1__.SessionProvider, {\n        session: session,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_contexts_NextAuthContext__WEBPACK_IMPORTED_MODULE_2__.AuthProvider, {\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"min-h-screen bg-gray-50\",\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                    ...pageProps\n                }, void 0, false, {\n                    fileName: \"C:\\\\Users\\\\Sammy\\\\OneDrive\\\\Desktop\\\\provenv\\\\pages\\\\_app.tsx\",\n                    lineNumber: 14,\n                    columnNumber: 11\n                }, this)\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\Sammy\\\\OneDrive\\\\Desktop\\\\provenv\\\\pages\\\\_app.tsx\",\n                lineNumber: 13,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\Sammy\\\\OneDrive\\\\Desktop\\\\provenv\\\\pages\\\\_app.tsx\",\n            lineNumber: 12,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\Sammy\\\\OneDrive\\\\Desktop\\\\provenv\\\\pages\\\\_app.tsx\",\n        lineNumber: 11,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDaUQ7QUFDUztBQUM1QjtBQUVmLFNBQVNFLElBQUksRUFDMUJDLFNBQVMsRUFDVEMsV0FBVyxFQUFFQyxPQUFPLEVBQUUsR0FBR0QsV0FBVyxFQUMzQjtJQUNULHFCQUNFLDhEQUFDSiw0REFBZUE7UUFBQ0ssU0FBU0E7a0JBQ3hCLDRFQUFDSixtRUFBWUE7c0JBQ1gsNEVBQUNLO2dCQUFJQyxXQUFVOzBCQUNiLDRFQUFDSjtvQkFBVyxHQUFHQyxTQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFLbEMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9wcm92ZW52LW5leHRqcy8uL3BhZ2VzL19hcHAudHN4PzJmYmUiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBBcHBQcm9wcyB9IGZyb20gJ25leHQvYXBwJ1xyXG5pbXBvcnQgeyBTZXNzaW9uUHJvdmlkZXIgfSBmcm9tICduZXh0LWF1dGgvcmVhY3QnXHJcbmltcG9ydCB7IEF1dGhQcm92aWRlciB9IGZyb20gJy4uL2NvbnRleHRzL05leHRBdXRoQ29udGV4dCdcclxuaW1wb3J0ICcuLi9zdHlsZXMvZ2xvYmFscy5jc3MnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBcHAoeyBcclxuICBDb21wb25lbnQsIFxyXG4gIHBhZ2VQcm9wczogeyBzZXNzaW9uLCAuLi5wYWdlUHJvcHMgfSBcclxufTogQXBwUHJvcHMpIHtcclxuICByZXR1cm4gKFxyXG4gICAgPFNlc3Npb25Qcm92aWRlciBzZXNzaW9uPXtzZXNzaW9ufT5cclxuICAgICAgPEF1dGhQcm92aWRlcj5cclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1pbi1oLXNjcmVlbiBiZy1ncmF5LTUwXCI+XHJcbiAgICAgICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvQXV0aFByb3ZpZGVyPlxyXG4gICAgPC9TZXNzaW9uUHJvdmlkZXI+XHJcbiAgKVxyXG59XHJcbiJdLCJuYW1lcyI6WyJTZXNzaW9uUHJvdmlkZXIiLCJBdXRoUHJvdmlkZXIiLCJBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiLCJzZXNzaW9uIiwiZGl2IiwiY2xhc3NOYW1lIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/_app.tsx\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "next-auth/react":
/*!**********************************!*\
  !*** external "next-auth/react" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("next-auth/react");

/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("./pages/_app.tsx")));
module.exports = __webpack_exports__;

})();