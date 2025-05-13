from app import db, login_manager
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import os

# Encryption key for saved passwords
def get_encryption_key():
    secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key')
    salt = b'password-manager-salt'  # This should ideally be stored securely
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(secret_key.encode()))
    return key

# Encryption helper functions
def encrypt_password(password):
    cipher_suite = Fernet(get_encryption_key())
    encrypted_password = cipher_suite.encrypt(password.encode())
    return encrypted_password.decode()

def decrypt_password(encrypted_password):
    cipher_suite = Fernet(get_encryption_key())
    decrypted_password = cipher_suite.decrypt(encrypted_password.encode())
    return decrypted_password.decode()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    saved_passwords = db.relationship('SavedPassword', backref='owner', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'

class SavedPassword(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Adiciona a restrição unique para name e user_id
    __table_args__ = (db.UniqueConstraint('name', 'user_id', name='_name_user_unique'),)
    
    def set_password(self, raw_password):
        self.password = encrypt_password(raw_password)
    
    def get_password(self):
        return decrypt_password(self.password)
    
    def __repr__(self):
        return f'<SavedPassword {self.name}>'

@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id)) 