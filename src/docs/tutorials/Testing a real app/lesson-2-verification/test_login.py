from target import get_client


def test_login_missing_fields_returns_400():
    client = get_client()
    response = client.post('/api/auth/login', json={'email': 'admin@mfg.com'})
    assert response.status_code == 400
    body = response.get_json()
    assert 'error' in body


def test_login_unknown_email_returns_401_generic_error():
    client = get_client()
    response = client.post('/api/auth/login', json={
        'email': 'no-such-user@mfg.com',
        'password': 'whatever',
    })
    assert response.status_code == 401
    body = response.get_json()
    assert body['error'] == 'Invalid credentials'


def test_login_wrong_password_returns_the_same_401_generic_error():
    client = get_client()
    response = client.post('/api/auth/login', json={
        'email': 'admin@mfg.com',
        'password': 'not-the-real-password',
    })
    assert response.status_code == 401
    body = response.get_json()
    assert body['error'] == 'Invalid credentials'


def test_login_valid_credentials_returns_token_and_user():
    client = get_client()
    response = client.post('/api/auth/login', json={
        'email': 'admin@mfg.com',
        'password': 'admin',
    })
    assert response.status_code == 200
    body = response.get_json()

    token = body['token']
    assert isinstance(token, str)
    assert token.count('.') == 2  # JWT: header.payload.signature

    user = body['user']
    assert user['id'] == 'admin'
    assert user['email'] == 'admin@mfg.com'
    assert user['role'] == 'admin'
    assert 'password_hash' not in user
    assert 'password' not in user
