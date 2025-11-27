from gestion.utils import sendgrid_utils


def test_sendgrid_client_success(monkeypatch):
    # Simulate SendGridAPIClient available and returning 202
    class FakeResponse:
        status_code = 202

    class FakeSG:
        def __init__(self, api_key):
            self.api_key = api_key

        def send(self, message):
            return FakeResponse()

    monkeypatch.setattr(sendgrid_utils, 'SendGridAPIClient', FakeSG)
    # Monkeypatch Mail to a simple callable that constructs minimal message
    class FakeMail:
        def __init__(self, from_email, to_emails, subject, html_content):
            self.from_email = from_email
            self.to_emails = to_emails
            self.subject = subject
            self.html_content = html_content

    monkeypatch.setattr(sendgrid_utils, 'Mail', FakeMail)

    # Ensure environment/config is present
    import os
    os.environ['SENDGRID_API_KEY'] = 'fake-key'

    ok = sendgrid_utils.send_alert_email('to@example.com', 'sub', '<p>hi</p>', async_send=False)
    assert ok is True
