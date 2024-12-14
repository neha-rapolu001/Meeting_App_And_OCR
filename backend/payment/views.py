import json
import traceback
import stripe
import pytz
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from church.models import Church
from payment.models import Payment
from stripe import Price
from datetime import datetime


# Set your Stripe API key
stripe.api_key = "sk_test_51QCnjCJk3xnHtdxhgIe0RNohGvJprRIWSGzNAsUkfDPIGV8p2rAEPSXj9oiKDiR5ILiWX2QULLRZK3y5YjsMeyfQ00Fr9SQyv6"

@csrf_exempt
def charge_card(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            payment_method_id = data.get('payment_method')
            amount = data.get('amount')
            church_id = data.get('church_id')
            email = data.get('email')
            print('payment_method_id:', payment_method_id)
            print('amount:', amount)
            print('church_id: ', church_id)
            print('email:', email)
            if not all([payment_method_id, amount, church_id, email]):
                return JsonResponse({'error': 'Missing required fields'}, status=400)


            customer = stripe.Customer.create(
                    payment_method=payment_method_id,
                    email=email,
                    invoice_settings={'default_payment_method': payment_method_id}, 
                )
            # Retrieve or create customer on Stripe
            #try:
                #customer = stripe.Customer.retrieve()
            #except stripe.error.InvalidRequestError:
                #customer = stripe.Customer.create(
                #    payment_method=payment_method_id,
                #    email=email,
                #    invoice_settings={'default_payment_method': payment_method_id}, 
                #)

            transaction = None

            # Charge the customer
            transaction = stripe.PaymentIntent.create(
                customer=customer.id,
                payment_method=payment_method_id,
                amount=amount*100,
                currency='usd',
                confirm=True,
                off_session=True,
            )

            print("Transaction details:", transaction)
            print("Transaction status:", transaction.status)
            print("Transaction last_payment_error:", transaction.last_payment_error)
            print("Amount received:", transaction.amount_received)

            if transaction.status == 'succeeded':
                Payment.objects.create(
                    transaction_id=transaction.stripe_id,
                    payment_id=payment_method_id,
                    amount=amount,
                    email=email,
                    date=datetime.now(pytz.utc),
                    success=True
                )
                return JsonResponse({'message': 'Payment successful', 'payment_id': payment_method_id}, status=200)

            Payment.objects.create(
                payment_id=payment_method_id,
                transaction_id=transaction.stripe_id,
                amount=amount,
                email=email,
                date=datetime.now(pytz.utc),
                success=False
            )
            return JsonResponse({'error': 'Payment failed'}, status=400)

            return JsonResponse({'message': 'Payment successful','payment_id':payment_method_id}, status=200)
        except stripe.error.CardError as e:
            Payment.objects.create(
                payment_id=payment_method_id,
                transaction_id=transaction.stripe_id,
                amount=amount,
                email=email,
                date=datetime.now(pytz.utc),
                success=False
            )
            return JsonResponse({'error': e.user_message}, status=400)
        except stripe.error.StripeError as e:
            Payment.objects.create(
                payment_id=payment_method_id,
                transaction_id=transaction.stripe_id,
                amount=amount,
                email=email,
                date=datetime.now(pytz.utc),
                success=False
            )
            return JsonResponse({'error': 'Stripe error occurred'}, status=500)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({'error': 'An unexpected error occurred'}, status=500)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    

@csrf_exempt
def fetch_card_details(request):
    try:
        data = json.loads(request.body)
        payment_method = stripe.PaymentMethod.retrieve(data['payment_id'])
        if payment_method.card:
            card_details = {
                "brand": payment_method.card.brand,
                "last4": payment_method.card.last4,
                "exp_month": payment_method.card.exp_month,
                "exp_year": payment_method.card.exp_year
            }
            return JsonResponse({'cardDetails': card_details})
        else:
            return JsonResponse({'error': 'Card details not found'}, status=404)
    except stripe.error.StripeError as e:
        print(str(e))
        return JsonResponse({'error': 'Stripe error occurred'}, status=500)


def get_all_payments(request):
    try:
        payments = Payment.objects.all()
        payment_list = []
        for payment in payments:
            '''
            print('payment_id:', payment.payment_id,
                'transaction_id:', payment.transaction_id,
                'church_id:', payment.church.id or 'none',
                'church_name:', payment.church.name,
                'email:', payment.email,
                'date:', payment.date,
                'amount:', payment.amount,
                'is_success:', payment.success,)
            '''
            if payment.church:
                payment_details = {
                    'payment_id': payment.payment_id,
                    'transaction_id': payment.transaction_id,
                    'church_id': payment.church.id,
                    'church_name': payment.church.name,
                    'email': payment.email,
                    'date': payment.date,
                    'amount': payment.amount,
                    'is_success': payment.success,
                }
            else:
                payment_details = {
                    'payment_id': payment.payment_id,
                    'transaction_id': payment.transaction_id,
                    'church_id': 'N/A',
                    'church_name': 'N/A',
                    'email': payment.email,
                    'date': payment.date,
                    'amount': payment.amount,
                    'is_success': False,
                }
            #card_details = fetch_card_details(payment.payment_id)
            #if card_details:
             #   payment_details.update(card_details)
            payment_list.append(payment_details)
        return JsonResponse({'payments': payment_list}, status=200)
    except Exception as e:
        print(str(e))
        return JsonResponse({'error': str(e)}, status=500)
    
@csrf_exempt
def create_payment_method(request):
    if request.method == "POST":
        data = json.loads(request.body)
        print(data)
        payment_id = data.get("payment_method")
        church_id = int(data.get('church'))
        church = Church.objects.get(id=church_id)
        email = data.get("email")

        try:
            Payment.objects.create(
                payment_id=payment_id,
                transaction_id="Card Update",
                amount=church.subscription.price,
                email=email,
                date=datetime.now(pytz.utc),
                success=True,
                church = church
            )

            return JsonResponse({"payment_method_id": payment_id})
        except stripe.error.StripeError as e:
            print(str(e))
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)


def repeat_payment_in_stripe(payment_id, email, amount, church):
    transaction_id = None
    customer_id = None
    try:
        customer = stripe.Customer.list(email=email, limit=1)

        if customer.data:
            customer_id = customer.data[0].id
        else:
            customer = stripe.Customer.create(email=email)
            customer_id = customer.id
        
        stripe.PaymentMethod.attach(
            payment_id,
            customer=customer_id
        )
        
        payment = stripe.PaymentMethod.retrieve(payment_id)
        new_payment_intent = stripe.PaymentIntent.create(
            amount=int(amount),
            payment_method=payment_id,
            currency='usd',
            customer=customer_id,
            return_url="http://localhost:3000",
            #return_url="https://meeting-app-and-ocr-two.vercel.app",
            confirm=True
        )
        transaction_id = new_payment_intent.stripe_id
        Payment.objects.create(
                payment_id=payment_id,
                transaction_id=transaction_id,
                amount=amount/100,
                email=email,
                date=datetime.now(pytz.utc),
                success=True,
                church = church
            )
        print("Repeated payment in Stripe. New payment ID:", new_payment_intent.id)
    except Exception as e:
        Payment.objects.create(
                payment_id=payment_id,
                transaction_id=transaction_id if transaction_id is not None else "-",
                amount=amount/100,
                email=email,
                date=datetime.now(pytz.utc),
                success=False,
                church = church
            )
        print("Error repeating payment in Stripe:", str(e))