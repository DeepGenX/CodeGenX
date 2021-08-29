package com.deepgenx.CodeGenX;

import org.json.JSONObject;
import org.springframework.util.StringUtils;

public class Utils {

    public static String parseErrorMessage(String message) {
        if (message == null) {
            return null;
        }

        // Capitalize the message
        message = StringUtils.capitalize(message.toLowerCase());

        // Make sure the message ends with a period
        if (!message.endsWith(".")) {
            message += ".";
        }

        return message;
    }

    public static String createResponse(boolean success, Error error, String output) {
        // Create a json object
        JSONObject response = new JSONObject();

        // Set the success, error and output values
        response.put("success", success);
        response.put("error", error.message);
        response.put("output", output);

        // Return the json object as a string
        return response.toString();
    }
}
