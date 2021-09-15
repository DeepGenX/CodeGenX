import hashlib
import secrets
import errors

def generate_token(email: str) -> str:
	return f"{secrets.token_hex(16)}.{hash(email)}"

def hash(string: str) -> str:
	return hashlib.md5(string.encode("utf-8")).hexdigest()

class TokenManager:
	def __init__(self, token_path: str) -> None:
		self.token_path = token_path
		
		with open(self.token_path, "r") as f:
			self.tokens = set(f.readlines())

	def __store_tokens(self) -> None:
		with open(self.token_path, "w") as f:
			f.write("\n".join(self.tokens))

	def add_token(self, email: str) -> str:
		# Check if there already exists a token with this email
		hashedEmail = hash(email)
		for token in self.tokens:
			if token.split(".")[-1] == hashedEmail: # Compare the hashed email to the one in the token
				raise errors.TokenAlreadyExistsError(token) # If the token already exists, throw an exception

		# Else, create a new token
		token = generate_token(email)

		# Add the token to the token set and update the token file
		self.tokens.add(token)
		self.__store_tokens()

		# Return the newly created token
		return token