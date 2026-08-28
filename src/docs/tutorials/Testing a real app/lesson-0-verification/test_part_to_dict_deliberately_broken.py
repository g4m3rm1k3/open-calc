from app import create_app
from app.models import Part
from app.models.part import Part as PartClass


def _broken_to_dict(self):
    return {'id': self.id + '-OOPS', 'partNumber': self.part_number, 'description': self.description}


def test_to_dict_reflects_the_fields_i_actually_set():
    PartClass.to_dict = _broken_to_dict
    app = create_app('testing')
    with app.app_context():
        part = Part(
            id='P-TEST',
            part_number='1234567',
            description='Test Bracket',
        )
        data = part.to_dict()
        assert data['id'] == 'P-TEST'
