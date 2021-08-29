package com.deepgenx.CodeGenX;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@SpringBootApplication
@RestController
public class CodeGenXApplication {

	public static AccountManager accountManager;
	public static CodeGenerator codeGenerator;

	public static void main(String[] args) {
		// Set up an AccountManager
		accountManager = new AccountManager();

		// Set up a CodeGenerator
		codeGenerator = new CodeGenerator(1.08, 512, 0.94);

		// TESTING
		String output = """
# Importing modules
import pandas as pd
import numpy as np
import scipy as sp
import plotly.offline as plotly
import figviz.astropy as fv
	
# converting pandas dataframe to numpy array
df = pd.DataFrame({'RR': np.arange(80,84,1)}, index=pd.date_range(start=start_date, freq="D", periods=5)).sort_values(by='RR')
final_df = df.iloc[4:-5]
d = np.array(final_df.values)
	
# Converting dates in string to datetime format
final_df['date_check'] = [pd.to_datetime(t) for t in final_df['date_check']]
	
# Setting columns for color-theme and font size of the plot
default_plotly_font_size = 16
color_theme = dict(colors=['#DE6D20','#000106','#095A78','#80A957','#16B851','#2E8B55'], family='Arial', sizes=['60', default_plotly_font_size, '60', default_plotly_font_size, '60', default_plotly_font_size, '60'])
	
# Plotly calls the plot method of Figure, where the dots of the function are plotted on a simple scatter plot.
	
fig = fv.make_subplots(rows=1, cols=2, squeeze=True)
fig.subplot(2,1,1)
fig.subplot(2,1,2)
	
# y: number of dots to add to the x-axis
# n: 30, just a constant
n = 30
x = np.arange(1, len(d)+1, 1)
	
y = [10, 20, 30, 40, 50, 60]
x1 = pd.DataFrame({'x': x})
x1['y'] = y
""";

		codeGenerator.parseOutput("py", output);

		// Run the CodeGenXApplication
//		SpringApplication.run(CodeGenXApplication.class, args);
	}

	@PostMapping("/generate")
	public String generate(@RequestParam String token, @RequestParam String language, @RequestParam String input) {
		System.out.println("Received request from token \"" + token + "\", language \"" + language + "\", input \"" + input + "\".");

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
