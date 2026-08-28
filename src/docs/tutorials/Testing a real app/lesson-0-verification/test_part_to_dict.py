from app import create_app
from app.models import Part


def test_to_dict_reflects_the_fields_i_actually_set():
    app = create_app('testing')
    with app.app_context():
        part = Part(
            id='P-TEST',
            part_number='1234567',
            description='Test Bracket',
        )
        data = part.to_dict()
        assert data['id'] == 'P-TEST'
        assert data['partNumber'] == '1234567'
        assert data['description'] == 'Test Bracket'


def test_to_dict_status_is_none_before_any_database_write():
    app = create_app('testing')
    with app.app_context():
        part = Part(
            id='P-TEST-2',
            part_number='7654321',
            description='Another Bracket',
        )
        data = part.to_dict()
        assert data['status'] is None
