from datetime import datetime
import threading
import time
from django.apps import AppConfig
from django.db.utils import OperationalError, ProgrammingError
from django.db import connection
import logging

logger = logging.getLogger(__name__)

class PaymentScheduler(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'payment'

    def ready(self):
        # Start the thread only after migrations and DB setup
        def start_thread_after_migrations():
            try:
                # Check if the Church table exists before proceeding
                with connection.cursor() as cursor:
                    cursor.execute("SHOW TABLES LIKE 'church_church'")
                    result = cursor.fetchone()
                    if not result:
                        logger.warning("The Church table doesn't exist yet. Background task will not start.")
                        return  # Exit if the table does not exist

                # Only import here to avoid errors if migrations aren't done
                from payment.views import Payment, repeat_payment_in_stripe
                from church.models import Church

                def subscription_payment_automation():
                    while True:
                        try:
                            # Ensure the database is accessible
                            churches = Church.objects.filter(deleted=False)
                            for church in churches:
                                days_since_creation = (datetime.now().date() - church.date_created.date()).days
                                if days_since_creation > 28 and days_since_creation % 28 == 0:
                                    most_recent_payment = Payment.objects.filter(church=church).order_by('-date').first()
                                    if most_recent_payment:
                                        payment_id = most_recent_payment.payment_id
                                        repeat_payment_in_stripe(payment_id, most_recent_payment.email, church.subscription.price * 100, church)
                                    else:
                                        logger.warning("No recent payment found for church: %s", church.id)
                        except OperationalError as e:
                            logger.error(f"Database error in subscription payment automation: {e}")
                        # Sleep for 1 day (86400 seconds)
                        time.sleep(86400)

                # Start the background thread
                thread = threading.Thread(target=subscription_payment_automation)
                thread.daemon = True
                thread.start()

            except (OperationalError, ProgrammingError) as e:
                # Log if there is an issue with checking the table or starting the thread
                logger.warning(f"Unable to start background thread due to DB issue: {e}")

        # Run the function to check for migrations and start the thread
        start_thread_after_migrations()
