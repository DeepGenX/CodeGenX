from typing import *

import hashlib
import secrets
import errors
import pickle

REQUESTS_PER_MINUTE = 5
HASH_FUNCTION = hashlib.sha256

def generate_token(email: str) -> str:
	return f"{HASH_FUNCTION.__name__}.{secrets.token_hex(32)}.{hash(email.lower())}"

def hash(string: str) -> str:
	return HASH_FUNCTION(string.encode("utf-8")).hexdigest()

class TokenManager:
	def __init__(self, token_path: str) -> None:
		self.token_path = token_path
		
		with open(self.token_path, "rb") as f:
			tokens, disabled = pickle.load(f)

		self.tokens: Set[str] = tokens
		self.disabled: Set[str] = disabled

		self.__store_tokens()
		
		self.cooldowns = {}
		self.update_all_cooldowns()

	def __store_tokens(self) -> None:
		self.all = self.tokens.copy()
		self.all.update(self.disabled)

		with open(self.token_path, "wb") as f:
			pickle.dump((self.tokens, self.disabled), f)

	def validate_token(self, token: str) -> Optional[errors.TokenError]:
		parts = token.split(".")

		# The token must consist of 3 parts seperated by a dot
		if len(parts) != 3:
			return errors.TokenInvalidError(token)

		# The second part of the token must have a length of 64 characters
		if len(parts[1]) != 64:
			return errors.TokenInvalidError(token)

		# After we made sure the token has a valid format, we want to know if it has been disabled or not
		if token in self.disabled:
			return errors.TokenDisabledError(token)

		# If the token does not exist, return an invalid token error
		if token not in self.tokens:
			return errors.TokenInvalidError(token)

	def get_token(self, email: str) -> Optional[str]:
		hashedEmail = hash(email)
		for token in self.all:
			if token.split(".")[-1] == hashedEmail: # Compare the hashed email to the one in the token
				return token

	def add_token(self, email: str) -> str:
		# Check if there already exists a token with this email
		if self.get_token(email) != None:
			raise errors.EmailAlreadyUsed(email)

		# Else, create a new token
		token = generate_token(email)

		# Add the token to the token set and update the token file
		self.tokens.add(token)
		self.__store_tokens()

		# Update the cooldowns so the new user gets their requests
		self.update_cooldown(token)

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

		# Update the token file
		self.__store_tokens()
	
	def update_cooldown(self, token: str) -> None:
		self.cooldowns[token] = REQUESTS_PER_MINUTE

	def update_all_cooldowns(self) -> None:
		for token in self.tokens:
			self.update_cooldown(token)