package com.deepgenx.CodeGenX;

public enum Error {
    // Code generation
    GENERATION_TIMEOUT("code generation timed out"),

    // Token validation
    TOKEN_INVALID("token is invalid"),
    TOKEN_DISABLED("token has been disabled"),

    // Misc
    NONE(null),
    LANGUAGE_NOT_SUPPORTED("language is not supported");

    public final String message;

    private Error(String message) {
        this.message = Utils.parseErrorMessage(message);
    }
};
