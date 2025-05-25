from app import create_app
import os

app = create_app()

if __name__ == '__main__':
    # Verifica se o banco de dados deve ser recriado (para migrações)
    if os.environ.get('RECREATE_DB', '').lower() == 'true':
        with app.app_context():
            from app import db
            print("Recriando tabelas de banco de dados...")
            db.drop_all()
            db.create_all()
            print("Banco de dados recriado com sucesso!")
            
            # Criar usuário de teste se não existir
            from app.models.user import User
            if not User.query.filter_by(username='admin').first():
                user = User(username='admin', email='admin@example.com')
                user.set_password('admin123')
                db.session.add(user)
                db.session.commit()
                print("Usuário de teste criado: admin / admin123")
    
    # Inicia a aplicação
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'True').lower() == 'true'
    
    print("\n=== Servidor Flask iniciado ===")
    print("URL da API: http://localhost:5000")
    print("Para acessar a API de outro dispositivo, use seu IP local")
    print("Endpoints disponíveis:")
    print("  - /                (GET)  - Verificação de status")
    print("  - /auth/login      (POST) - Login de usuário")
    print("  - /auth/register   (POST) - Registro de usuário")
    print("  - /api/generate    (POST) - Gerar senha")
    print("  - /api/passwords   (GET)  - Listar senhas (requer autenticação)")
    print("  - /api/passwords   (POST) - Salvar senha (requer autenticação)")
    print("  - /api/passwords/id (DELETE) - Excluir senha (requer autenticação)")
    print("==============================\n")
    
    app.run(host="0.0.0.0", port=8089) 