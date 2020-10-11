"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validRegister = void 0;
exports.validRegister = (options) => {
    if (options.password.length <= 2) {
        return [
            {
                field: "password",
                message: "password is too short.",
            },
        ];
    }
    if (options.username.length <= 2) {
        return [
            {
                field: "username",
                message: "username is too short",
            },
        ];
    }
    if (!options.email.includes("@")) {
        return [
            {
                field: "email",
                message: "email is not valid.",
            },
        ];
    }
    if (options.username.includes("@")) {
        return [
            {
                field: "username",
                message: "username cannot contain @",
            },
        ];
    }
    return null;
};
//# sourceMappingURL=validateRegister.js.map