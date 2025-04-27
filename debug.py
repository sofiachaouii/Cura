import jwt

token = "8VMu3zUdQpZ0VfuU4skpe2keEcmlb1cUwWpZCqEWjPAPVspIvbrBSN/UH25knb9psZ2fEGpHvPilLeuKZklaqQ=="
# Remove any surrounding quotes if you pasted them
payload = jwt.decode(token, options={"verify_signature": False})
print(payload)

