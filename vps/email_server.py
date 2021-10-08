import os
import smtplib
import time

from email.MIMEMultipart import MIMEMultipart
from email.MIMEText import MIMEText
from email.MIMEImage import MIMEImage

import errors

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
    
    def send_email(address: str, subject: str, content: str) -> None:
        # If we"ve already sent a verification code that is still valid, raise an EmailVerificationAlreadySent error
        now = time.time()
        if address in self.__sent_emails:
            if now - self.__sent_emails[address] < VERIFY_TIME:
                raise errors.EmailVerificationAlreadySent(address)
        self.__sent_emails[address] = now

        # Create the email
        message = MIMEMultipart("related")
        message["Subject"] = subject
        message["From"] = self.__server.user
        message["To"] = address
        message.preamble = "This is a multi-part message in MIME format."

        # Encapsulate the plain and HTML versions of the message body in an
        # "alternative" part, so message agents can decide which they want to display.
        msgAlternative = MIMEMultipart("alternative")
        message.attach(msgAlternative)

        msgText = MIMEText("This is the alternative plain text message.")
        msgAlternative.attach(msgText)

        # We reference the image in the IMG SRC attribute by the ID we give it below
        msgText = MIMEText("<b>Some <i>HTML</i> text</b> and an image.<br><img src=\"cid:logo\"><br>Nifty!", "html")
        msgAlternative.attach(msgText)

        # This example assumes the image is in the current directory
        with open(os.path.join(os.path.dirname(__file__), "../assets/logo_blackwite.png"), "rb") as f:
            logo = MIMEImage(f.read())

        # Define the image"s ID as referenced above
        logo.add_header("Content-ID", "<logo>")
        message.attach(logo)

        # f"Subject: {subject}\n\n{self.format.replace("{CONTENT}", content)}"

        # Send the email
        self.__server.sendmail(self.__server.user, address, message.as_string())