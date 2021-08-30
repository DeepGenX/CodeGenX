#!/bin/python3

from flask import Flask, request
from gpt_output import get_output
from text_processing import process_blocks, process_output, process_input, count_leading_spaces, COMMENTS
import requests
import json
from typing import *


app = Flask(__name__)

def get_ip() -> str:
    "Returns the server ip."

    return requests.get("http://icanhazip.com/").text.strip()

@app.route("/", methods=["POST"])
def main() -> str:
    blocks = process_blocks(process_output(request.form.get("input"), get_output(process_input(request.form.get("input"), request.form.get("language"))), request.form.get("language")), count_leading_spaces(request.form.get("input").splitlines()[-1]), COMMENTS[request.form.get("language")]) # Get the output for the processed input

    return json.dumps({blocks}) # Return the array of blocks as a json string

if __name__ == "__main__":
    app.run(get_ip(), port=5781)