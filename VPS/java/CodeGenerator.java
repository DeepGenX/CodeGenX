package com.deepgenx.CodeGenX;

import org.json.JSONObject;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.function.Predicate;
import java.util.logging.Level;

public class CodeGenerator extends Result {

    // The GPT-J api url
    public static final String API_URL = "http://api.vicgalle.net:5000/generate";

    public static final Map<String, String> commentMap = Map.ofEntries(
            Map.entry("py", "#"),
            Map.entry("c", "//"),
            Map.entry("cpp", "//"),
            Map.entry("cs", "//"),
            Map.entry("java", "//"),
            Map.entry("js", "//"),
            Map.entry("ts", "//"),
            Map.entry("html", "<!--"),
            Map.entry("css", "/*")
    );

    // GPT-J parameters
    private final double temperature;
    private final int maxLength;
    private final double topP;

    public CodeGenerator(double temperature, int maxLength, double topP) {
        this.temperature = temperature;
        this.maxLength = maxLength;
        this.topP = topP;
    }

    public String generate(String language, String input) throws IOException {
        // Here we can keep track of what languages are being used the most, what kind of input and what size of input is used often, etc.

        // Processing the input to get a better output
        input = input.replaceAll("\\s+$", "") + "\n"; // Remove trailing whitespace and add a newline

        // Creating an HttpURLConnection
        HttpURLConnection connection = (HttpURLConnection)new URL(API_URL + "?" + (
            "context=" + URLEncoder.encode(input, StandardCharsets.UTF_8) +
            "&token_max_length=" + URLEncoder.encode(String.valueOf(this.maxLength), StandardCharsets.UTF_8) +
            "&temperature=" + URLEncoder.encode(String.valueOf(this.temperature), StandardCharsets.UTF_8) +
            "&top_p=" + URLEncoder.encode(String.valueOf(this.topP), StandardCharsets.UTF_8)
        )).openConnection();

        // Setting the request method
        connection.setRequestMethod("POST");

        // Setting timeouts
        connection.setConnectTimeout(3000); // Connection timeout: 3 seconds
        connection.setReadTimeout(25000); // Read timeout: 25 seconds

        // Connecting and reading the response
        StringBuilder content = new StringBuilder();
        try {
            BufferedReader in = new BufferedReader(
                    new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8));
            String inputLine;
            while ((inputLine = in.readLine()) != null) {
                content.append(inputLine);
            }
            in.close();
        } catch (java.net.SocketTimeoutException e) {
            setResult(false, Error.GENERATION_TIMEOUT);
            return null;
        }

        // Disconnecting
        connection.disconnect();

        // Setting the result
        setResult(true, Error.NONE);

        // Parse the text that GPT-J returned and return it
        Utils.logger.log(Level.INFO, content.toString());
        return parseOutput(language, input, new JSONObject(content.toString()).getString("text"));
    }

    // SHOULD BE PRIVATE
    public String parseOutput(String language, String input, String output) {
        // Replace all tabs with 4 spaces, so we don't have to deal with different types of indentation
        output = output.replace("\t", "    ");

        // Remove all code that's indented less than the last line of the input
        List<String> inputLines = input.lines().toList();
        int lastInputIndent = getIndent(inputLines.get(inputLines.size() - 1));

        StringBuilder relevantCode = new StringBuilder();
        for (String line : output.lines().toList()) {
            if (!line.isBlank() && getIndent(line) < lastInputIndent) {
                break;
            }

            relevantCode.append(line).append('\n'); // Append the line of code and a newline character
        }

        output = relevantCode.toString();

        // Turn the output in to blocks, separated by comments
        List<String> blocks = new ArrayList<>();

        List<String> lines = output.lines().toList();
        int startLine = 0, blocksLength = 0;

        String comment = commentMap.get(language);

        while (blocksLength < output.length()) {
            StringBuilder block = new StringBuilder();

            int startIndent = getIndent(lines.get(startLine));

            int i = 0;
            List<String> subList = lines.subList(startLine, lines.size());
            for (String line : subList) {
                int currentIndent = getIndent(line);

                block.append(line).append('\n'); // Append the line and a newline character

                blocksLength += line.length(); // Line size
                blocksLength++; // Newline character

                startLine++;

                Predicate<String> isComment = (String l) -> l.trim().startsWith(comment);
                if (isComment.test(line) && currentIndent == startIndent && !block.toString().lines().allMatch(isComment)) {
                    if (i + 1 < subList.size() && !isComment.test(subList.get(i + 1))) {
                        break;
                    }
                }

                i++;
            }

            blocks.add(block.toString());
        }

        return String.join("<|block_separator|>\n", blocks);
    }

    private int getIndent(String line) {
        int count = 0;

        // Loop through the characters in the line
        boolean readCharacters = true;
        for (char character : line.toCharArray()) {
            switch (character) {
                case ' ' -> // If we encounter a space, increment the count by 1
                    count++;
                case '\t' -> // Else if we encounter a tab, increment the count by 4
                    count += 4;
                default ->
                    readCharacters = false; // Else, we've run out of leading spaces, and we can now stop counting
            }

            if (!readCharacters) {
                break;
            }
        }

        return count;
    }

}
