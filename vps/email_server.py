import os
import smtplib
import time

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage

import api_constants, errors

class EmailServer:
    def __init__(self, email: str, password: str) -> None:
        # Setting up smtp server
        self.__server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        self.__server.login(email, password)

        # Keeping track of what addresses we have sent emails to and when
        self.__sent_emails = {}

        # Load the email format
        with open(os.path.join(os.path.dirname(__file__), "email_format")) as f:
            self.format = f.read()
    
    def send_email(self, address: str, subject: str, content: str) -> None:
        # If we"ve already sent a verification code that is still valid, raise an EmailVerificationAlreadySent error
        now = time.time()
        if address in self.__sent_emails:
            if now - self.__sent_emails[address] < api_constants.VERIFY_TIME:
                raise errors.EmailVerificationAlreadySent(address)
        self.__sent_emails[address] = now

        # Create the email (https://stackoverflow.com/questions/920910/sending-multipart-html-emails-which-contain-embedded-images)
        # TODO: Clean this function (remove unnecessary code)
        message = MIMEMultipart("related")
        message["Subject"] = subject
        message["From"] = self.__server.user
        message["To"] = address
        # message.preamble = "This is a multi-part message in MIME format."

        # Encapsulate the plain and HTML versions of the message body in an
        # "alternative" part, so message agents can decide which they want to display.
        alternative = MIMEMultipart("alternative")
        message.attach(alternative)

        msgText = MIMEText("This is the alternative plain text message.")
        alternative.attach(msgText)

        # We reference the image in the IMG SRC attribute by the ID we give it below
        msgText = MIMEText(self.format.replace("{CONTENT}", content).replace("\n", "<br>"), "html")
        alternative.attach(msgText)

        # Adding images
        for filename in os.listdir("../assets"):
            with open(filename, "rb") as f:
                logo = MIMEImage(f.read())

            # Define the image"s ID as referenced above
            logo.add_header("Content-ID", f"<{filename}>")

            # Attaching the image
            if f"img src=\"cid:{filename}\"" in self.format:
                message.attach(logo)

        # Send the email
        self.__server.sendmail(self.__server.user, address, message.as_string())
