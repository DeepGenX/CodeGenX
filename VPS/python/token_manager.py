import hashlib
import secrets

def hash(string: str) -> str:
	return hashlib.md5(string.encode("utf-8")).hexdigest()

def generate_token(email: str) -> str:
	return f"{secrets.token_hex(16)}.{hash(email)}"

for i in range(10):
	print(generate_token("matthiasx95@gmail.com"))