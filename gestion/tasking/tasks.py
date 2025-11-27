"""Task implementation moved to a package to keep project organized.

This module provides `send_alert_task` which either uses Huey (if installed)
or falls back to running the work in a background thread.
"""
import logging
import threading

logger = logging.getLogger(__name__)

try:
    from huey import RedisHuey
    HUEY = RedisHuey('sismepa')
except Exception:
    HUEY = None


def _send_work(to_email, subject, html_content):
    try:
        from ..utils.sendgrid_utils import send_alert_email
        return send_alert_email(to_email, subject, html_content, async_send=False)
    except Exception as e:
        logger.exception('Error in send work: %s', e)
        return False


if HUEY is not None:
    @HUEY.task()
    def send_alert_task(to_email, subject, html_content):
        return _send_work(to_email, subject, html_content)
else:
    def send_alert_task(to_email, subject, html_content):
        try:
            thread = threading.Thread(target=_send_work, args=(to_email, subject, html_content), daemon=True)
            thread.start()
            return True
        except Exception as e:
            logger.exception('Failed to start alert thread: %s', e)
            return _send_work(to_email, subject, html_content)
