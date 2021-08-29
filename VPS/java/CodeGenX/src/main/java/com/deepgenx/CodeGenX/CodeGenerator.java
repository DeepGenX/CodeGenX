package com.deepgenx.CodeGenX;

import net.savantly.graphite.query.ParameterStringBuilder;
import org.json.JSONObject;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.function.Predicate;

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
        return parseOutput(language, new JSONObject(content.toString()).getString("text"));
    }

    // SHOULD BE PRIVATE
    public String parseOutput(String language, String output) {
        // Turn the output in to blocks, separated by comments
        List<String> blocks = new ArrayList<String>();

        List<String> lines = output.lines().toList();
        int startLine = 0, blocksLength = 0;

        String comment = commentMap.get(language);

        while (blocksLength < output.length()) {
            StringBuilder block = new StringBuilder();

            int startIndent = countLeadingSpaces(lines.get(startLine));

            int i = 0;
            for (String line : lines.subList(startLine, lines.size())) {
                int currentIndent = countLeadingSpaces(line);

                block.append(line); // Append the line
                block.append('\n'); // and a newline character

                blocksLength += line.length(); // Line size
                blocksLength++; // Newline character

                startLine++;

                Predicate<String> isComment = (String l) -> l.trim().startsWith(comment);

                String isCommentString = String.valueOf(isComment.test(line));
                System.out.println(isCommentString + new String(new char[10 - isCommentString.length()]).replace("\0", " ") + line);

                if (isComment.test(line) && currentIndent == startIndent && !block.toString().lines().allMatch(isComment)) {
                    if (i + 1 < lines.subList(startLine, lines.size()).size() && !isComment.test(lines.subList(startLine, lines.size()).get(i + 1))) {
                        System.out.println("=============");
                        break;
                    } else {
                        System.out.println("-------------");
                    }
                }

                i++;
            }

            blocks.add(block.toString());
        }

//        System.out.println(String.join("============\n", blocks));
        return String.join(", ", blocks);
    }

    private int countLeadingSpaces(String line) {
        int count = 0;

        // Loop through the characters in the line
        for (char character : line.toCharArray()) {
            if (character == ' ') { // If we encounter a space, increment count
                count++;
            } else { // Else, we've ran out of leading spaces and we can now stop counting
                break;
            }
        }

        return count;
    }

}
