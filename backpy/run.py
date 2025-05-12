from app import create_app

app = create_app()

if __name__ == '__main__':
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
    
    # Listen on all interfaces (0.0.0.0) so it's accessible from React Native
    app.run(host='0.0.0.0', port=5000, debug=True) 