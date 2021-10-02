from typing import *

import hashlib
import secrets
import errors
import pickle

REQUESTS_PER_MINUTE = 5

def generate_token(email: str) -> str:
	return f"{secrets.token_hex(16)}.{hash(email.lower())}"

def hash(string: str) -> str:
	return hashlib.md5(string.encode("utf-8")).hexdigest()

class TokenManager:
	def __init__(self, token_path: str) -> None:
		self.token_path = token_path
		
		with open(self.token_path, "r") as f:
			self.tokens, self.disabled = pickle.load(f)
		
		self.cooldowns = {}
		for token in self.tokens:
			self.cooldowns[token] = REQUESTS_PER_MINUTE

	def __store_tokens(self) -> None:
		with open(self.token_path, "w") as f:
			pickle.dump((self.tokens, self.disabled), f)

	def validate_token(self, token: str) -> Optional[errors.TokenError]:
		parts = token.split(".")

		# The token must consist of 2 parts seperated by a dot
		if len(parts) != 2:
			return errors.TokenInvalidError(token)

		# The first part of the token must have a length of 16 characters
		if len(parts[0]) != 16:
			return errors.TokenInvalidError(token)

		# After we made sure the token has a valid format, we want to know if it has been disabled or not
		if token in self.disabled:
			return errors.TokenDisabledError(token)

		# If the token does not exist, return an invalid token error
		if token not in self.tokens:
			return errors.TokenInvalidError(token)

	def add_token(self, email: str) -> str:
		# Check if there already exists a token with this email
		hashedEmail = hash(email)
		for token in (self.tokens | self.disabled):
			if token.split(".")[-1] == hashedEmail: # Compare the hashed email to the one in the token
				raise errors.TokenAlreadyExistsError(token) # If the token already exists, throw an exception

		# Else, create a new token
		token = generate_token(email)

		# Add the token to the token set and update the token file
		self.tokens.add(token)
		self.__store_tokens()

		# Update the cooldowns so the new user gets their requests
		self.update_cooldowns()

		# Return the newly created token
		return token
	
	def disable_token(self, token: str) -> None:
		# If the token is already disabled, raise an error
		if token in self.disabled:
			raise errors.TokenDisabledError(token)

		# If the token does not exist, raise an error
		if token not in self.tokens:
			raise errors.TokenInvalidError(token)
		
		self.tokens.remove(token)
		self.disabled.add(token)
	
	def update_cooldowns(self) -> None:
		for token in self.tokens:
			self.cooldowns[token] = REQUESTS_PER_MINUTE