from flask import Blueprint, request, jsonify
from app import db, token_required
from app.models.user import SavedPassword
import random
import string

password_bp = Blueprint('password', __name__)

# API para gerar senha - Não requer autenticação
@password_bp.route('/api/generate', methods=['POST'])
def api_generate_password():
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "Dados inválidos"}), 400
    
    length = data.get('length', 12)
    include_uppercase = data.get('include_uppercase', True)
    include_lowercase = data.get('include_lowercase', True)
    include_numbers = data.get('include_numbers', True)
    include_symbols = data.get('include_symbols', True)
    
    password = generate_password(
        length=length,
        include_uppercase=include_uppercase,
        include_lowercase=include_lowercase,
        include_numbers=include_numbers,
        include_symbols=include_symbols
    )
    
    return jsonify({'password': password, 'message': 'Senha gerada com sucesso'})

# API para salvar senha - Requer autenticação
@password_bp.route('/api/passwords', methods=['POST'])
@token_required
def save_password(current_user):
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "Dados inválidos"}), 400
    
    # Verifica campos obrigatórios
    if not data.get('name') or not data.get('password'):
        return jsonify({"message": "Nome e senha são campos obrigatórios"}), 400
    
    password = SavedPassword(
        name=data.get('name'),
        password=data.get('password'),
        website=data.get('website', ''),
        username=data.get('username', ''),
        user_id=current_user.id
    )
    
    db.session.add(password)
    db.session.commit()
    
    return jsonify({
        "message": "Senha salva com sucesso", 
        "password_id": password.id
    }), 201

# API para listar senhas - Requer autenticação
@password_bp.route('/api/passwords', methods=['GET'])
@token_required
def get_passwords(current_user):
    saved_passwords = current_user.saved_passwords.order_by(SavedPassword.created_at.desc()).all()
    
    passwords_list = []
    for password in saved_passwords:
        passwords_list.append({
            'id': password.id,
            'name': password.name,
            'password': password.password,
            'website': password.website,
            'username': password.username,
            'created_at': password.created_at.isoformat()
        })
    
    return jsonify({'passwords': passwords_list})

# API para excluir senha - Requer autenticação
@password_bp.route('/api/passwords/<int:id>', methods=['DELETE'])
@token_required
def delete_password(current_user, id):
    password = SavedPassword.query.get_or_404(id)
    
    # Verifica se a senha pertence ao usuário atual
    if password.user_id != current_user.id:
        return jsonify({"message": "Você não tem permissão para excluir esta senha"}), 403
    
    db.session.delete(password)
    db.session.commit()
    
    return jsonify({"message": "Senha excluída com sucesso"}), 200

def generate_password(length, include_uppercase, include_lowercase, include_numbers, include_symbols):
    # Define character sets
    uppercase_chars = string.ascii_uppercase
    lowercase_chars = string.ascii_lowercase
    number_chars = string.digits
    symbol_chars = string.punctuation
    
    # Create a pool of characters based on selected options
    char_pool = ''
    if include_uppercase:
        char_pool += uppercase_chars
    if include_lowercase:
        char_pool += lowercase_chars
    if include_numbers:
        char_pool += number_chars
    if include_symbols:
        char_pool += symbol_chars
    
    # If no character sets were selected, default to lowercase
    if not char_pool:
        char_pool = lowercase_chars
    
    # Generate password
    password = ''.join(random.choice(char_pool) for _ in range(length))
    
    # Ensure at least one character from each selected character set
    required_chars = []
    if include_uppercase and not any(c in uppercase_chars for c in password):
        required_chars.append(random.choice(uppercase_chars))
    if include_lowercase and not any(c in lowercase_chars for c in password):
        required_chars.append(random.choice(lowercase_chars))
    if include_numbers and not any(c in number_chars for c in password):
        required_chars.append(random.choice(number_chars))
    if include_symbols and not any(c in symbol_chars for c in password):
        required_chars.append(random.choice(symbol_chars))
    
    # Replace random positions in the password with required characters
    for char in required_chars:
        position = random.randint(0, length - 1)
        password = password[:position] + char + password[position+1:]
    
    return password 