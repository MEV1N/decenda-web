import random
import time

ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

def generate_token(length):
    
    # Get local time
    now = time.localtime()

    
    seed = now.tm_hour * 10000 + now.tm_min * 100 + now.tm_sec

    random.seed(seed)

    token = ""
    for _ in range(length):
        token += random.choice(ALPHABET)

    return token


def flag():
    with open("flag.txt", "r") as f:
        print("\nFLAG:")
        print(f.read())


def main():
    print("===================================")
    print(" Token Guessing Challenge ")
    print("===================================")

    token_length = 20
    token = generate_token(token_length)

    attempts = 0

    while attempts < 50:
        guess = input("\nEnter your guess for the token (or type exit): ").strip()

        if guess == "exit":
            print("Exiting...")
            break

        attempts += 1

        if guess == token:
            print("\nCorrect token!")
            flag()
            break
        else:
            print("Wrong token.")

        if attempts == 50:
            print("\nYou exhausted your attempts.")


if __name__ == "__main__":
    main()
