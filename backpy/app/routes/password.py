from flask import Blueprint, request, jsonify
from app import db, token_required
from app.models.user import SavedPassword, encrypt_password, decrypt_password
from sqlalchemy.exc import IntegrityError
import random
import string
import logging

# Configurar logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

password_bp = Blueprint('password', __name__)

# API para gerar senha - Não requer autenticação
@password_bp.route('/api/generate', methods=['POST'])
def api_generate_password():
    logger.info("Gerando senha...")
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
    
    logger.info(f"Senha gerada com sucesso: {password[:2]}***")
    return jsonify({'password': password, 'message': 'Senha gerada com sucesso'})

# API para salvar senha - Requer autenticação
@password_bp.route('/api/passwords', methods=['POST'])
@token_required
def save_password(current_user):
    logger.info(f"Salvando senha para usuário: {current_user.username}")
    data = request.get_json()
    
    if not data:
        logger.warning("Dados inválidos ao salvar senha")
        return jsonify({"message": "Dados inválidos"}), 400
    
    # Verifica campos obrigatórios
    if not data.get('name') or not data.get('password'):
        logger.warning("Nome ou senha não fornecidos")
        return jsonify({"message": "Nome e senha são campos obrigatórios"}), 400
    
    # Verifica se já existe uma senha com este nome para o usuário
    existing_password = SavedPassword.query.filter_by(
        user_id=current_user.id,
        name=data.get('name')
    ).first()
    
    if existing_password:
        logger.warning(f"Tentativa de criar senha com nome duplicado: {data.get('name')}")
        return jsonify({
            "message": "Já existe uma senha com este nome. Escolha um nome diferente."
        }), 400
    
    # Cria nova senha
    password = SavedPassword(
        name=data.get('name'),
        user_id=current_user.id
    )
    
    # Use the encryption method to set the password
    try:
        password.set_password(data.get('password'))
        
        db.session.add(password)
        db.session.commit()
        logger.info(f"Senha salva com sucesso. ID: {password.id}")
        
        return jsonify({
            "message": "Senha salva com sucesso", 
            "password_id": password.id
        }), 201
    except IntegrityError:
        db.session.rollback()
        logger.error(f"Erro de integridade ao salvar senha: nome duplicado")
        return jsonify({
            "message": "Já existe uma senha com este nome. Escolha um nome diferente."
        }), 400
    except Exception as e:
        logger.error(f"Erro ao salvar senha: {str(e)}")
        db.session.rollback()
        return jsonify({"message": f"Erro ao salvar senha: {str(e)}"}), 500

# API para listar senhas - Requer autenticação
@password_bp.route('/api/passwords', methods=['GET'])
@token_required
def get_passwords(current_user):
    logger.info(f"Obtendo senhas para usuário: {current_user.username}")
    saved_passwords = current_user.saved_passwords.order_by(SavedPassword.created_at.desc()).all()
    
    passwords_list = []
    for password in saved_passwords:
        try:
            # Tenta descriptografar a senha
            decrypted_password = password.get_password()
        except Exception as e:
            logger.warning(f"Erro ao descriptografar senha, usando texto original: {str(e)}")
            # Se falhar, assume que a senha está em texto simples e atualiza para criptografada
            decrypted_password = password.password
            # Atualiza a senha para o formato criptografado
            try:
                password.set_password(decrypted_password)
                db.session.commit()
            except Exception as encrypt_error:
                logger.error(f"Erro ao criptografar senha: {str(encrypt_error)}")
                db.session.rollback()
            
        passwords_list.append({
            'id': password.id,
            'name': password.name,
            'password': decrypted_password,
            'created_at': password.created_at.isoformat()
        })
    
    logger.info(f"Retornando {len(passwords_list)} senhas")
    return jsonify({'passwords': passwords_list})

# API para excluir senha - Requer autenticação
@password_bp.route('/api/passwords/<int:id>', methods=['DELETE'])
@token_required
def delete_password(current_user, id):
    logger.info(f"Excluindo senha ID {id} para usuário: {current_user.username}")
    password = SavedPassword.query.get_or_404(id)
    
    # Verifica se a senha pertence ao usuário atual
    if password.user_id != current_user.id:
        logger.warning(f"Tentativa não autorizada de excluir senha ID {id}")
        return jsonify({"message": "Você não tem permissão para excluir esta senha"}), 403
    
    try:
        db.session.delete(password)
        db.session.commit()
        logger.info(f"Senha ID {id} excluída com sucesso")
        return jsonify({"message": "Senha excluída com sucesso"}), 200
    except Exception as e:
        logger.error(f"Erro ao excluir senha: {str(e)}")
        db.session.rollback()
        return jsonify({"message": f"Erro ao excluir senha: {str(e)}"}), 500

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