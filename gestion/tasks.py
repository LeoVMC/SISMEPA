"""Wrapper to keep `import gestion.tasks` working while implementation
is located under `gestion.tasking.tasks` for better organization.
"""
from .tasking.tasks import send_alert_task, HUEY

__all__ = ['send_alert_task', 'HUEY']
