from python27 import braintree
from apiconfig import *
from protorpc import remote
import datetime
import logging
braintree.Configuration.configure(braintree.Environment.Sandbox,
                                  merchant_id="b9hg6czg7dy9njgm",
                                  public_key="wy5t8dq5rbs9x53j",
                                  private_key="d71fe8c3b083f72653e0b9a6004ba9a6")

payment = endpoints.api(name='payment', version='v1',
                        allowed_client_ids=[WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID],
                        audiences=[ANDROID_AUDIENCE])


@payment.api_class(resource_name='payment')
class PaymentApi(remote.Service):

    @endpoints.method(IncomingMessage, OutgoingMessage, path='braintree/test',
                      http_method='POST', name='auth.braintree')
    def braintree(self, request):

        result = braintree.Transaction.sale({
            "amount": "100000.00",
            "credit_card": {
                "number": "4111111111111111",
                "expiration_month": "05",
                "expiration_year": "2020"
            }
        })
        if result.is_success:
            out = "success!: " + result.transaction.id
        elif result.transaction:
            out = "Error processing transaction:"
            out += "  message: " + result.message
            out += "  code:    " + result.transaction.processor_response_code
            out += "  text:    " + result.transaction.processor_response_text
        else:
            out = "message: " + result.message
            for error in result.errors.deep_errors:
                out += "attribute: " + error.attribute
                out += "  code: " + error.code
                out += "  message: " + error.message
        return OutgoingMessage(error='', data=json_dump(out))


    @endpoints.method(IncomingMessage, OutgoingMessage, path='braintree/test_subscription',
                      http_method='POST', name='auth.braintree_subscription')
    def braintree_subscription(self, request):
        out = ''
        out2 = ''
        result = braintree.Customer.create({
            "first_name": 'Derek',
            "last_name": 'Wene',
            "credit_card": {
                "number": "4111111111111111",
                "expiration_month": "05",
                "expiration_year": "2020",
                "cvv": '000'
            }
        })
        if result.is_success:
            customer = braintree.Customer.find(result.customer.id)
            payment_method_token = customer.credit_cards[0].token
            result2 = braintree.Subscription.create({
            "payment_method_token": payment_method_token,
            "plan_id": "normal_monthly_plan"
            })
            if result2.is_success:
                return OutgoingMessage(error='', data='OK')
        else:
            out = "message: " + result.message
            for error in result.errors.deep_errors:
                out += "attribute: " + error.attribute
                out += "  code: " + error.code
                out += "  message: " + error.message
        return OutgoingMessage(error='', data=json_dump([out, out2]))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='braintree/test_update_subscription',
                      http_method='POST', name='auth.test_update_subscription')
    def test_update_subscription(self, request):

        #org = Organization.query(Organization.name == 'testorg123').get()
        #subscription = braintree.Subscription.find(org.subscription_id)
        result = braintree.Subscription.update('g23762', {
            "price": "14.00"
        })
        if result.is_success:
            return OutgoingMessage(error='', data='OK')
        else:
            return OutgoingMessage(error='Something wrong..', data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='pay/subscribe',
                      http_method='POST', name='pay.subscribe')
    def subscribe(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        organization = request_user.organization.get()
        data = json.loads(request.data)
        if not organization.customer_id and not organization.subscription_id:
            customer_result = braintree.Customer.create({
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "credit_card": {
                    "number": data["number"],
                    "expiration_month": data["exp_month"],
                    "expiration_year": data["exp_year"],
                    "cvv": data["cvv"],
                    "options": {
                        "verify_card": True
                    }
                }
            })
            if not customer_result.is_success:
                return OutgoingMessage(error='INVALID_CARD', data=customer_result.message)
            organization.customer_id = customer_result.customer.id
            organization.payment_token = customer_result.customer.credit_cards[0].token
        elif not organization.subscription_id and len(data) > 0:
            card_result = braintree.CreditCard.create({
                "customer_id": organization.customer_id,
                "number": data["number"],
                "expiration_month": data["exp_month"],
                "expiration_year": data["exp_year"],
                "cvv": data["cvv"],
                "options": {
                    "verify_card": True
                }
            })
            if card_result.is_success:
                organization.payment_token = card_result.credit_card.token
            else:
                OutgoingMessage(error='CARD_ERROR', data=card_result.message)
        if organization.trial_period:
            subscription_result = braintree.Subscription.create({
                "payment_method_token": organization.payment_token,
                "plan_id": "normal_monthly_plan"
            })
        else:
            user_count = len(User.query(User.organization == request_user.organization).fetch(projection=
                                                                                              [User.first_name]))
            if not organization.cancel_subscription:
                subscription_result = braintree.Subscription.create({
                    "payment_method_token": organization.payment_token,
                    "plan_id": "normal_monthly_plan",
                    "trial_period": False,
                    "price": str(float(user_count) * float(organization.cost))
                })
            else:
                subscription_result = braintree.Subscription.create({
                    "payment_method_token": organization.payment_token,
                    "plan_id": "normal_monthly_plan",
                    "trial_period": False,
                    "first_billing_date": organization.cancel_subscription,
                    "price": str(float(user_count) * float(organization.cost))
                })
            if not subscription_result.is_success:
                organization.put()
            return OutgoingMessage(error='SUBSCRIPTION_ERROR', data=subscription_result.message)
        organization.subscription_id = subscription_result.subscription.id
        organization.subscribed = True
        organization.trial_period = False
        organization.cancel_subscription = None
        organization.put()
        return OutgoingMessage(error='', data='OK')


    @endpoints.method(IncomingMessage, OutgoingMessage, path='pay/change_card_number',
                      http_method='POST', name='pay.change_card_number')
    def change_card_number(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        organization = request_user.organization.get()
        if not organization.customer_id:
            return OutgoingMessage(error=NOT_SUBSCRIBED)

        data = json.loads(request.data)
        if not organization.customer_id and not organization.subscription_id:
            card_result = braintree.CreditCard.create({
                "customer_id": organization.customer_id,
                "number": data["number"],
                "expiration_month": data["exp_month"],
                "expiration_year": data["exp_year"],
                "cvv": data["cvv"],
                "options": {
                    "verify_card": True
                }
            })
            if not card_result.is_success:
                return OutgoingMessage(error='INVALID CARD', data=card_result.message)

            subscription_result = braintree.Subscription.update(organization.subscription_id,{
                "payment_method_token": card_result.credit_card.token,
            })
            if not subscription_result.is_success:
                organization.put()
                return OutgoingMessage(error='SUBSCRIPTION_ERROR', data=subscription_result.message)
            organization.payment_token = card_result.credit_card.token
            organization.subscription_id = subscription_result.subscription.id
            organization.put()
            return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='pay/subscription_info',
                      http_method='POST', name='pay.subscription_info')
    def subscription_info(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        organization = request_user.organization.get()
        message = dict()
        if organization.subscription_id:
            subscription = braintree.Subscription.find(organization.subscription_id)
            message["paid_through_date"] = subscription.paid_through_date
            message["subscription_price"] = str(subscription.price)
            message["next_billing_date"] = subscription.next_billing_date
        else:
            message["no_subscription"] = True
            message["premium_end"] = organization.cancel_subscription
        if organization.payment_token:
            credit_card = braintree.CreditCard.find(organization.payment_token)
            card = dict()
            card["masked_number"] = credit_card.masked_number
            card["expiration"] = credit_card.expiration_date
            card["cardholder_name"] = credit_card.cardholder_name
            card["image_url"] = credit_card.image_url
            message["credit_card"] = card
        return OutgoingMessage(error='', data=json_dump(message))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='pay/cancel_subscription',
                      http_method='POST', name='pay.cancel_subscription')
    def cancel_subscription(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        organization = request_user.organization.get()
        if not organization.customer_id:
            return OutgoingMessage(error=NOT_SUBSCRIBED)
        subscription = braintree.Subscription.find(organization.subscription_id)
        if subscription:
            organization.cancel_subscription = subscription.next_billing_date
        result = braintree.Subscription.cancel(organization.subscription_id)
        if result.is_success:
            organization.subscription_id = ''
            organization.put()
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error='SUBSCRIPTION_CANCELLATION_FAIL', data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='pay/is_subscribed',
                      http_method='POST', name='pay.is_subscribed')
    def is_subscribed(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        organization = request_user.organization.get()
        return OutgoingMessage(error='', data=json_dump(True))