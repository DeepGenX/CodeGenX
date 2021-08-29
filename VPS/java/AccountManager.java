package com.deepgenx.CodeGenX;

public class AccountManager extends Result {

    // Manage accounts, validate tokens, use some kind of database, send verification emails? etc.

    public void validateToken(String token) {
        // Validate the token
        // ...

        // Remove this code when the validation code is done (this code is just here for testing purposes)
        switch (token)
        {
            case "valid_token":
                setResult(true, Error.NONE);
                break;
            default:
                setResult(false, Error.TOKEN_INVALID);
                break;
        }
    }

}
