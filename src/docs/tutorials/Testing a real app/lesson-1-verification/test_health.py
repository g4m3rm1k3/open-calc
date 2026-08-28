from target import get_client


def test_health_returns_200_and_status_healthy():
    client = get_client()
    response = client.get('/health')
    assert response.status_code == 200
    body = response.get_json()
    assert body['status'] == 'healthy'
