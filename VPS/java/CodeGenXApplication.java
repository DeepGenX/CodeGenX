package com.deepgenx.CodeGenX;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;

@SpringBootApplication
@RestController
public class CodeGenXApplication {

	public static AccountManager accountManager;
	public static CodeGenerator codeGenerator;

	public static void main(String[] args) {
		// Set up an AccountManager
		accountManager = new AccountManager();

		// Set up a CodeGenerator
		codeGenerator = new CodeGenerator(1.22, 512, 0.94);

		// Run the CodeGenXApplication
		SpringApplication.run(CodeGenXApplication.class, args);
	}

	@PostMapping("/generate")
	public String generate(@RequestParam String token, @RequestParam String language, @RequestParam String input) {
		Utils.logger.log(Level.INFO, "Received request from token \"" + token + "\", language \"" + language + "\", input \"" + input + "\".");

		// Make sure the language is supported
		if (!CodeGenerator.commentMap.containsKey(language)) {
			return Utils.createResponse(false, Error.LANGUAGE_NOT_SUPPORTED, null);
		}

		// Validate the token
		accountManager.validateToken(token);

		// Return an error message if the token is invalid
		if (!accountManager.success) {
			return Utils.createResponse(false, accountManager.error, null);
		}

		// Generate the output
		String output = "";
		try {
			output = codeGenerator.generate(language, input);
		} catch (IOException e) {
			e.printStackTrace();
		}

		// Return an error message if the output could not be generated
		if (!codeGenerator.success) {
			return Utils.createResponse(false, codeGenerator.error, null);
		}

		// If nothing went wrong, return the output
		return Utils.createResponse(true, Error.NONE, output);
	}

}
