import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Environment, PackageLoader, select_autoescape

from app.core.config import settings

env = Environment(
    loader=PackageLoader("app", "templates/email"),
    autoescape=select_autoescape(["html", "xml"])
)

def send_email(
    to_addresses: list[str],
    subject: str,
    template_name: str,
    template_vars: dict
) -> bool:
    """Send an email using the configured SMTP server."""
    try:
        msg = MIMEMultipart()
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = ", ".join(to_addresses)
        msg["Subject"] = subject

        template = env.get_template(f"{template_name}.html")
        html_content = template.render(**template_vars)
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            if settings.SMTP_TLS:
                server.starttls()
            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False
