import os
import threading
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail
except Exception:
    SendGridAPIClient = None
    Mail = None


def _send_sync(api_key, from_email, to_email, subject, html_content):
    """Internal synchronous send using SendGrid. Returns True on accepted send."""
    if not api_key or SendGridAPIClient is None or Mail is None:
        return False

    message = Mail(
        from_email=from_email,
        to_emails=to_email,
        subject=subject,
        html_content=html_content,
    )

    try:
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        return getattr(response, 'status_code', None) in (200, 202)
    except Exception as e:
        logger.exception('SendGrid send failed: %s', e)
        return False


def send_alert_email(to_email, subject, html_content, async_send=True):
    """Send an email using SendGrid.

    - In development, if API key or client missing, returns False silently.
    - By default sends asynchronously in a background thread to avoid blocking
      callers like `calcular_avance()`; set `async_send=False` to force sync send
      (useful for tests).
    """
    api_key = os.environ.get('SENDGRID_API_KEY') or getattr(settings, 'SENDGRID_API_KEY', '')
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@example.com')

    if not api_key or SendGridAPIClient is None or Mail is None:
        logger.debug('SendGrid not configured or client missing; skipping send')
        return False

    if async_send:
        thread = threading.Thread(
            target=_send_sync,
            args=(api_key, from_email, to_email, subject, html_content),
            daemon=True,
        )
        try:
            thread.start()
            return True
        except Exception as e:
            logger.exception('Failed to start send thread: %s', e)
            return _send_sync(api_key, from_email, to_email, subject, html_content)
    else:
        return _send_sync(api_key, from_email, to_email, subject, html_content)
