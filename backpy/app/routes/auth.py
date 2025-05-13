from flask import Blueprint, request, jsonify
import jwt
import datetime
import os

from app import db, token_required
from app.models.user import User

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "Dados inválidos"}), 400
        
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"message": "Username e senha são obrigatórios"}), 400
    
    user = User.query.filter_by(username=username).first()
    
    if not user or not user.check_password(password):
        return jsonify({"message": "Credenciais inválidas"}), 401
    
    # Gera o token JWT
    expiration = datetime.datetime.utcnow() + datetime.timedelta(days=1)
    token = jwt.encode(
        {"user_id": user.id, "exp": expiration},
        os.environ.get('SECRET_KEY', 'dev-secret-key'),
        algorithm="HS256"
    )
    
    return jsonify({
        "message": "Login realizado com sucesso",
        "access_token": token,
        "user_id": user.id,
        "username": user.username,
        "email": user.email
    }), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "Dados inválidos"}), 400
    
    # Verifica campos obrigatórios
    required_fields = ['username', 'email', 'password']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({
            "message": f"Campos obrigatórios ausentes: {', '.join(missing_fields)}"
        }), 400
    
    # Verifica se username ou email já existem
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"message": "Nome de usuário já está em uso"}), 400
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email já está em uso"}), 400
    
    # Cria o usuário
    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
        
    return jsonify({
        "message": "Usuário registrado com sucesso",
        "user_id": user.id
    }), 201

@auth_bp.route('/user-info', methods=['GET'])
@token_required
def get_user_info(current_user):
    """Rota para obter informações do usuário autenticado"""
    return jsonify({
        "user_id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "created_at": current_user.created_at.isoformat()
    }) 