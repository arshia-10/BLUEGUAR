# Simple console runner for BlueGuard (optional)
from .blueguard_engine import blueguard_response

def chat():
    print("🌊 BlueGuard — type 'exit' to quit.")
    while True:
        user = input("You: ").strip()
        if user.lower() in ("exit", "quit"):
            break
        resp = blueguard_response(user)
        print("BlueGuard:", resp)

if __name__ == "__main__":
    chat()
