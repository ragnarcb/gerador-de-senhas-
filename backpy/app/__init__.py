from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
import os
from datetime import datetime
from functools import wraps
import jwt

# Initialize extensions
db = SQLAlchemy()
login_manager = LoginManager()

# Helper para autenticação via token JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        from flask import request
        token = None
        
        # Obter o token do cabeçalho Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token de autenticação não fornecido'}), 401
        
        try:
            # Decodificar o token
            data = jwt.decode(
                token, 
                os.environ.get('SECRET_KEY', 'dev-secret-key'),
                algorithms=["HS256"]
            )
            
            # Obter o usuário a partir do token
            from app.models.user import User
            current_user = User.query.get(data['user_id'])
            
            if not current_user:
                return jsonify({'message': 'Usuário não encontrado'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expirado. Faça login novamente'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token inválido'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def create_app():
    app = Flask(__name__)
    
    # Enable CORS
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # Configure the app
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', 'sqlite:///app.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions with the app
    db.init_app(app)
    login_manager.init_app(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.password import password_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(password_bp)
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    # Rota padrão para verificar se a API está funcionando
    @app.route('/')
    def index():
        return jsonify({
            'message': 'API de Gerenciamento de Senhas',
            'status': 'online',
            'version': '1.0.0'
        })
    
    return app 