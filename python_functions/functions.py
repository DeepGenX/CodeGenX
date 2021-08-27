import requests
from termcolor import colored

def get_output(context, max_length=512, temp=1.0, top_p=0.6, top_k=40):
        payload = {
        "context": context,
        "token_max_length": max_length,
        "temperature": temp,
        "top_p": top_p,
        "top_k": top_k}

        response = requests.post("http://api.vicgalle.net:5000/generate", params=payload).json()
        output = response['text']
        return output

def print_output(inp):
        inp = inp.strip()
        ans = get_output(inp)
        ans = str(ans).split("<|endoftext|>")[0]
        #ans = ans.split('\t')[0]
        print(colored(inp,'cyan')+colored(ans,'yellow'))