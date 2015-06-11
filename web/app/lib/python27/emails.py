def welcomeEmail(user):
    title = 'You formed a new NeteGreek Organization'
    content = 'We are glad you are interested in using NeteGreek with your organization. Now that you have created your organization, your next steps are to add your members, set your leaders, and watch planning things get easier. We have tried to make everything as simple as possible. If you have any questions or comments, please hit the question mark at the top of the app and we will get back to you quickly. Your account is currently set up as a trial organization, but you can register your organization at any point in the next two weeks by adding a credit card in the organization account settings.'
    return {'title': title, 'content': content}

def activateWarning(user):
    title = 'Please Activate your NeteGreek Organization'
    content = 'We hope that your organization setup has been easy so far. If not, please let us know so we can help with any problems or questions you might have. We noticed that you have not yet activated your account. In order to keep your organization information, please add a credit card to your orgazations account settings. You have one week left to register.'
    return {'title': title, 'content': content}

def deleteWarning(user):
    title = 'Two days left for your NeteGreek Organization'
    content = 'In order to keep things lean, we delete organizations that are not registered within two weeks. If you would like to keep this organization, please register your organization by adding a credit card to the organization account settings. You have two days left!'
    return {'title': title, 'content': content}

def deleteOrg(user):
    title = 'Your Organization has been Deleted'
    content = 'We hope you were able to learn more about how NeteGreek could make managing your organization easier. Please help us out by taking this two question survey about why this organization was deleted: https://www.surveymonkey.com/s/95MP2ML'
    return {'title': title, 'content': content}

def activateOrg(user):
    title = 'Thanks for Registering!'
    content = 'Your organization is now registered. The credit card on file with your organization will be only be charged based on the agreements defined in your organization settings page.'
    return {'title': title, 'content': content}

def ccExpiring(user):
    title = 'Organization Credit Card Expiring Soon'
    content = 'We noticed that your registered credit card is expiring soon. Please update your credit card information to avoid any issues with future payments.'
    return {'title': title, 'content': content}
    
def birthdayEmail(user):
	title = 'Happy Birthday from NeteGreek'
	content = 'Live today like it is a special gift, because it is the best birthday gift. Happy Birthday!'
	return {'title': title, 'content': content}