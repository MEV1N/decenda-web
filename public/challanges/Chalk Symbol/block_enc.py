import time
import base64
import hashlib
import secrets


class Block:
    def __init__(self, index, previous_hash, timestamp, encoded_transactions, nonce):
        self.index = index
        self.previous_hash = previous_hash
        self.timestamp = timestamp
        self.encoded_transactions = encoded_transactions
        self.nonce = nonce

    def calculate_hash(self):
        block_string = f"{self.index}{self.previous_hash}{self.timestamp}{self.encoded_transactions}{self.nonce}"
        return hashlib.sha256(block_string.encode()).hexdigest()


def proof_of_work(previous_block, encoded_transactions):
    index = previous_block.index + 1
    timestamp = int(time.time())
    nonce = 0

    block = Block(index, previous_block.calculate_hash(),
                  timestamp, encoded_transactions, nonce)

    while not block.calculate_hash().startswith("00"):
        nonce += 1
        block.nonce = nonce

    return block


def blockchain_to_string(blockchain):
    return '-'.join([block.calculate_hash() for block in blockchain])


def xor_bytes(a, b):
    return bytes(x ^ y for x, y in zip(a, b))


def pad(data, block_size):
    padding_length = block_size - len(data) % block_size
    return data + bytes([padding_length] * padding_length)


def encrypt(plaintext, token, key):
    midpoint = len(plaintext) // 2
    modified_plaintext = plaintext[:midpoint] + token + plaintext[midpoint:]

    block_size = 16
    padded = pad(modified_plaintext.encode(), block_size)

    key_hash = hashlib.sha256(key).digest()
    ciphertext = b''

    for i in range(0, len(padded), 16):
        block = padded[i:i + 16]
        ciphertext += xor_bytes(block, key_hash)

    return ciphertext


# ---------------- MAIN ----------------

# 🔹 Take user input
flag_text = input("Enter text to embed: ")

# Generate random key
random_key = secrets.token_bytes(32)

print("Key:", random_key)   # ← raw bytes

# Create blockchain
genesis = Block(0, "0", int(time.time()), "Genesis", 0)
blockchain = [genesis]

for i in range(1, 5):
    tx = base64.b64encode(f"Transaction_{i}".encode()).decode()
    blockchain.append(proof_of_work(blockchain[-1], tx))

blockchain_string = blockchain_to_string(blockchain)

encrypted = encrypt(blockchain_string, flag_text, random_key)

print("Encrypted Blockchain:", encrypted)   # ← raw bytes
