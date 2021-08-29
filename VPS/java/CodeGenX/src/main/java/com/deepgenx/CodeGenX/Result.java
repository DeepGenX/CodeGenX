package com.deepgenx.CodeGenX;

public abstract class Result {

    public boolean success = false;
    public Error error = null;

    void setResult(boolean success, Error error) {
        this.success = success;
        this.error = error;
    }

}
